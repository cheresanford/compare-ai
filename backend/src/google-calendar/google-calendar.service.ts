import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventEntity } from "../events/event.entity";
import { GoogleCalendarSessionEntity } from "./google-calendar-session.entity";

type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

@Injectable()
export class GoogleCalendarService {
  private readonly requiredCalendarScopes = new Set([
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar",
  ]);
  private readonly oauthClientId: string | null;
  private readonly oauthClientSecret: string | null;
  private readonly oauthRedirectUri: string | null;
  private readonly frontendRedirectUrl: string;
  private readonly sessionId = 1;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(GoogleCalendarSessionEntity)
    private readonly sessionRepository: Repository<GoogleCalendarSessionEntity>,
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
  ) {
    this.oauthClientId = this.configService.get<string>("GOOGLE_CLIENT_ID") ?? null;
    this.oauthClientSecret =
      this.configService.get<string>("GOOGLE_CLIENT_SECRET") ?? null;
    this.oauthRedirectUri =
      this.configService.get<string>("GOOGLE_REDIRECT_URI") ?? null;
    this.frontendRedirectUrl =
      this.configService.get<string>("GOOGLE_FRONTEND_REDIRECT_URL") ??
      "http://localhost:8081/eventos";
  }

  getConnectUrl() {
    this.assertOAuthConfig();

    const params = new URLSearchParams({
      client_id: this.oauthClientId as string,
      redirect_uri: this.oauthRedirectUri as string,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  getFrontendRedirectUrl(params: Record<string, string>) {
    const url = new URL(this.frontendRedirectUrl);
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );
    return url.toString();
  }

  async completeOAuthCallback(code: string) {
    this.assertOAuthConfig();

    if (!code) {
      throw new BadRequestException("OAuth code ausente");
    }

    const token = await this.exchangeCodeForToken(code);
    if (!this.hasRequiredCalendarScope(token.scope)) {
      throw new ForbiddenException(
        "Permissoes insuficientes. Autorize o acesso ao Google Calendar e tente novamente.",
      );
    }
    const existingSession = await this.sessionRepository.findOne({
      where: { id: this.sessionId },
    });

    const refreshToken = token.refresh_token ?? existingSession?.refreshToken;
    const accountEmail = await this.fetchGoogleAccountEmail(token.access_token);

    const session = this.sessionRepository.create({
      id: this.sessionId,
      accessToken: token.access_token,
      refreshToken: refreshToken ?? null,
      scope: token.scope ?? existingSession?.scope ?? null,
      tokenType: token.token_type ?? existingSession?.tokenType ?? null,
      expiryDate: this.getTokenExpiryDate(token.expires_in),
      accountEmail,
    });

    await this.sessionRepository.save(session);
  }

  async getStatus() {
    const session = await this.sessionRepository.findOne({
      where: { id: this.sessionId },
    });

    if (!session) {
      return { connected: false };
    }

    const isAccessTokenValid =
      !session.expiryDate ||
      session.expiryDate.getTime() > Date.now() + 60 * 1000;
    const canRefresh = !!session.refreshToken;

    return {
      connected: isAccessTokenValid || canRefresh,
      accountEmail: session.accountEmail ?? null,
      expiresAt: session.expiryDate?.toISOString() ?? null,
    };
  }

  async disconnect() {
    const session = await this.sessionRepository.findOne({
      where: { id: this.sessionId },
    });

    if (!session) {
      return { disconnected: true };
    }

    await this.revokeAccessToken(session.accessToken);
    await this.sessionRepository.delete({ id: this.sessionId });
    return { disconnected: true };
  }

  async syncEvent(eventId: number) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: { category: true },
    });

    if (!event) {
      throw new BadRequestException("Evento local nao encontrado");
    }

    const accessToken = await this.getValidAccessToken();
    const payload = {
      summary: event.title,
      location: event.location,
      description: this.buildDescription(event),
      start: { dateTime: event.startDate.toISOString() },
      end: { dateTime: event.endDate.toISOString() },
      status: event.status === "canceled" ? "cancelled" : "confirmed",
    };

    const existingGoogleEventId = event.googleCalendarEventId;
    let action: "created" | "updated" = "created";
    let responseData: { id: string };

    if (existingGoogleEventId) {
      try {
        responseData = await this.callGoogleCalendar({
          path: `/calendar/v3/calendars/primary/events/${encodeURIComponent(existingGoogleEventId)}`,
          method: "PATCH",
          accessToken,
          body: payload,
        });
        action = "updated";
      } catch (error) {
        const statusCode =
          error instanceof HttpException ? error.getStatus() : undefined;
        if (statusCode !== 404) {
          throw error;
        }
        responseData = await this.callGoogleCalendar({
          path: "/calendar/v3/calendars/primary/events",
          method: "POST",
          accessToken,
          body: payload,
        });
      }
    } else {
      responseData = await this.callGoogleCalendar({
        path: "/calendar/v3/calendars/primary/events",
        method: "POST",
        accessToken,
        body: payload,
      });
    }

    event.googleCalendarEventId = responseData.id;
    await this.eventsRepository.save(event);

    return {
      action,
      googleCalendarEventId: responseData.id,
      eventId: event.id,
    };
  }

  private async getValidAccessToken() {
    const session = await this.sessionRepository.findOne({
      where: { id: this.sessionId },
    });

    if (!session) {
      throw new UnauthorizedException(
        "Sessao Google nao encontrada. Conecte-se novamente.",
      );
    }

    if (session.scope && !this.hasRequiredCalendarScope(session.scope)) {
      throw new ForbiddenException(
        "Sessao sem permissao de calendario. Desconecte e conecte novamente ao Google.",
      );
    }

    const tokenValid =
      !session.expiryDate ||
      session.expiryDate.getTime() > Date.now() + 60 * 1000;

    if (tokenValid && session.accessToken) {
      return session.accessToken;
    }

    if (!session.refreshToken) {
      throw new UnauthorizedException(
        "Sessao expirada. Conecte-se novamente ao Google.",
      );
    }

    const refreshed = await this.refreshAccessToken(session.refreshToken);
    session.accessToken = refreshed.access_token;
    session.expiryDate = this.getTokenExpiryDate(refreshed.expires_in);
    session.scope = refreshed.scope ?? session.scope;
    session.tokenType = refreshed.token_type ?? session.tokenType;
    await this.sessionRepository.save(session);

    return session.accessToken;
  }

  private async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    this.assertOAuthConfig();

    const body = new URLSearchParams({
      code,
      client_id: this.oauthClientId as string,
      client_secret: this.oauthClientSecret as string,
      redirect_uri: this.oauthRedirectUri as string,
      grant_type: "authorization_code",
    });

    return this.fetchJson<GoogleTokenResponse>(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      },
      "Falha ao obter token OAuth",
    );
  }

  private async refreshAccessToken(
    refreshToken: string,
  ): Promise<GoogleTokenResponse> {
    this.assertOAuthConfig();

    const body = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: this.oauthClientId as string,
      client_secret: this.oauthClientSecret as string,
      grant_type: "refresh_token",
    });

    return this.fetchJson<GoogleTokenResponse>(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      },
      "Falha ao renovar token OAuth",
    );
  }

  private async fetchGoogleAccountEmail(accessToken: string) {
    try {
      const data = await this.fetchJson<{ email?: string }>(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
        "Falha ao consultar conta Google",
      );
      return data.email ?? null;
    } catch {
      return null;
    }
  }

  private async callGoogleCalendar<T>({
    path,
    method,
    accessToken,
    body,
  }: {
    path: string;
    method: "POST" | "PATCH";
    accessToken: string;
    body: unknown;
  }) {
    return this.fetchJson<T>(
      `https://www.googleapis.com${path}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      "Falha ao sincronizar com Google Calendar",
    );
  }

  private async revokeAccessToken(accessToken: string) {
    try {
      const body = new URLSearchParams({ token: accessToken });
      await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
    } catch {
      // Melhor esforco: remove sessao local mesmo sem revogacao remota.
    }
  }

  private buildDescription(event: EventEntity) {
    const parts = [
      `Evento local #${event.id}`,
      `Organizador: ${event.organizerEmail}`,
      `Status local: ${event.status}`,
    ];

    if (event.category?.name) {
      parts.push(`Categoria: ${event.category.name}`);
    }

    return parts.join("\n");
  }

  private getTokenExpiryDate(expiresInSeconds?: number) {
    if (!expiresInSeconds || !Number.isFinite(expiresInSeconds)) {
      return null;
    }
    return new Date(Date.now() + expiresInSeconds * 1000);
  }

  private assertOAuthConfig() {
    if (!this.oauthClientId || !this.oauthClientSecret || !this.oauthRedirectUri) {
      throw new BadRequestException(
        "Google OAuth nao configurado. Defina GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REDIRECT_URI.",
      );
    }
  }

  private hasRequiredCalendarScope(scope?: string) {
    if (!scope) return false;
    const grantedScopes = new Set(scope.split(/\s+/).filter(Boolean));
    for (const requiredScope of this.requiredCalendarScopes) {
      if (grantedScopes.has(requiredScope)) return true;
    }
    return false;
  }

  private async fetchJson<T>(
    url: string,
    init: RequestInit,
    fallbackMessage: string,
  ): Promise<T> {
    const response = await fetch(url, init);
    const raw = await response.text();
    const payload = raw ? JSON.parse(raw) : {};

    if (!response.ok) {
      const message =
        payload?.error_description ||
        payload?.error?.message ||
        payload?.error ||
        fallbackMessage;

      if (response.status === 401) {
        throw new UnauthorizedException(message);
      }
      if (response.status === 403) {
        if (
          typeof message === "string" &&
          message.toLowerCase().includes("insufficient authentication scopes")
        ) {
          throw new ForbiddenException(
            "Permissoes insuficientes no Google Calendar. Desconecte e conecte novamente.",
          );
        }
        throw new ForbiddenException(message);
      }
      if (response.status === 404) {
        throw new NotFoundException(message);
      }
      throw new BadRequestException(message);
    }

    return payload as T;
  }
}
