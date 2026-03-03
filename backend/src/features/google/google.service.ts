import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import { GoogleToken } from "../../tables/google-tokens/entities/google-token.entity";
import { Event } from "../../tables/events/entities/event.entity";

export type GoogleAuthStatus = {
  connected: boolean;
  email?: string;
};

@Injectable()
export class GoogleIntegrationService {
  private oauthState: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(GoogleToken)
    private readonly googleTokenRepository: Repository<GoogleToken>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  getAuthUrl() {
    const { clientId, redirectUri, authUri, scopes } = this.getAuthConfig();
    const state = randomUUID();
    this.oauthState = state;

    const url = new URL(authUri);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("scope", scopes.join(" "));
    url.searchParams.set("state", state);

    return url.toString();
  }

  async handleCallback(code: string, state?: string) {
    if (this.oauthState && state && state !== this.oauthState) {
      throw new BadRequestException("Estado OAuth invalido.");
    }

    const { clientId, clientSecret, redirectUri, tokenUri } =
      this.getAuthConfig();

    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const response = await fetch(tokenUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new BadRequestException(
        payload?.error_description || "Falha ao autenticar no Google.",
      );
    }

    await this.saveTokens({
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      scope: payload.scope,
      tokenType: payload.token_type,
      expiryDate: payload.expires_in
        ? String(Date.now() + payload.expires_in * 1000)
        : null,
    });

    return { connected: true };
  }

  async getStatus(): Promise<GoogleAuthStatus> {
    const token = await this.getStoredToken();

    if (!token) {
      return { connected: false };
    }

    const accessToken = await this.getAccessToken();

    try {
      const userInfo = await this.fetchUserInfo(accessToken);
      return { connected: true, email: userInfo?.email };
    } catch {
      return { connected: true };
    }
  }

  async disconnect() {
    const token = await this.getStoredToken();
    if (token?.accessToken) {
      await this.revokeToken(token.accessToken).catch(() => undefined);
    }
    if (token?.refreshToken) {
      await this.revokeToken(token.refreshToken).catch(() => undefined);
    }

    if (token) {
      await this.googleTokenRepository.delete({ id: token.id });
    }

    return { disconnected: true };
  }

  async syncEvent(eventId: number) {
    const accessToken = await this.getAccessToken();
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: { user: true, status: true, category: true },
    });

    if (!event) {
      throw new NotFoundException("Evento nao encontrado.");
    }

    const calendarId =
      this.configService.get<string>("GOOGLE_CALENDAR_ID") || "primary";

    const requestBody = {
      summary: event.title,
      description: this.buildDescription(event),
      start: {
        dateTime: event.startDate.toISOString(),
      },
      end: {
        dateTime: event.endDate.toISOString(),
      },
    };

    let response;
    if (event.googleEventId) {
      response = await this.updateCalendarEvent(
        accessToken,
        calendarId,
        event.googleEventId,
        requestBody,
      );

      if (response?.error === "not_found") {
        response = await this.createCalendarEvent(
          accessToken,
          calendarId,
          requestBody,
        );
      }
    } else {
      response = await this.createCalendarEvent(
        accessToken,
        calendarId,
        requestBody,
      );
    }

    if (!response?.id) {
      throw new BadRequestException("Falha ao sincronizar evento.");
    }

    event.googleEventId = response.id;
    event.googleSyncedAt = new Date();
    await this.eventRepository.save(event);

    return {
      googleEventId: response.id,
      htmlLink: response.htmlLink,
      syncedAt: event.googleSyncedAt,
    };
  }

  private buildDescription(event: Event) {
    const lines = [
      `Local: ${event.location}`,
      `Organizador: ${event.user?.name || "-"} <${event.user?.email || "-"}>`,
      `Status: ${event.status?.name || "-"}`,
      `Categoria: ${event.category?.name || "Sem categoria"}`,
      `Evento ID local: ${event.id}`,
    ];

    return lines.join("\n");
  }

  private async fetchUserInfo(accessToken: string) {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new UnauthorizedException("Nao foi possivel obter dados do Google.");
    }

    return response.json();
  }

  private async createCalendarEvent(
    accessToken: string,
    calendarId: string,
    body: Record<string, unknown>,
  ) {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId,
      )}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new BadRequestException(
        payload?.error?.message || "Falha ao criar evento no Google Calendar.",
      );
    }

    return payload;
  }

  private async updateCalendarEvent(
    accessToken: string,
    calendarId: string,
    googleEventId: string,
    body: Record<string, unknown>,
  ) {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId,
      )}/events/${encodeURIComponent(googleEventId)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (response.status === 404) {
      return { error: "not_found" };
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new BadRequestException(
        payload?.error?.message || "Falha ao atualizar evento no Google Calendar.",
      );
    }

    return payload;
  }

  private async revokeToken(token: string) {
    const params = new URLSearchParams({ token });
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
  }

  private getAuthConfig() {
    const clientId = this.configService.get<string>("GOOGLE_CLIENT_ID");
    const clientSecret = this.configService.get<string>(
      "GOOGLE_CLIENT_SECRET",
    );
    const redirectUri = this.configService.get<string>(
      "GOOGLE_REDIRECT_URI",
    );
    const authUri =
      this.configService.get<string>("GOOGLE_AUTH_URI") ||
      "https://accounts.google.com/o/oauth2/auth";
    const tokenUri =
      this.configService.get<string>("GOOGLE_TOKEN_URI") ||
      "https://oauth2.googleapis.com/token";
    const scopesRaw =
      this.configService.get<string>("GOOGLE_SCOPES") ||
      "https://www.googleapis.com/auth/calendar";

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException(
        "Credenciais do Google nao configuradas.",
      );
    }

    return {
      clientId,
      clientSecret,
      redirectUri,
      authUri,
      tokenUri,
      scopes: scopesRaw.split(",").map((scope) => scope.trim()),
    };
  }

  private async getStoredToken() {
    return this.googleTokenRepository.findOne({ where: { id: 1 } });
  }

  private async saveTokens(input: {
    accessToken: string;
    refreshToken?: string | null;
    scope?: string | null;
    tokenType?: string | null;
    expiryDate?: string | null;
  }) {
    const existing = await this.getStoredToken();

    const entity = this.googleTokenRepository.create({
      id: existing?.id ?? 1,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken ?? existing?.refreshToken ?? null,
      scope: input.scope ?? existing?.scope ?? null,
      tokenType: input.tokenType ?? existing?.tokenType ?? null,
      expiryDate: input.expiryDate ?? existing?.expiryDate ?? null,
    });

    await this.googleTokenRepository.save(entity);
  }

  private async getAccessToken() {
    const token = await this.getStoredToken();
    if (!token?.accessToken) {
      throw new UnauthorizedException("Conecte ao Google antes de sincronizar.");
    }

    const expiry = token.expiryDate ? Number(token.expiryDate) : null;
    const now = Date.now();

    if (!expiry || expiry - now > 60000) {
      return token.accessToken;
    }

    if (!token.refreshToken) {
      throw new UnauthorizedException("Sessao expirada. Conecte novamente.");
    }

    return this.refreshAccessToken(token.refreshToken);
  }

  private async refreshAccessToken(refreshToken: string) {
    const { clientId, clientSecret, tokenUri } = this.getAuthConfig();

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const response = await fetch(tokenUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new UnauthorizedException(
        payload?.error_description || "Nao foi possivel renovar o token.",
      );
    }

    const expiryDate = payload.expires_in
      ? String(Date.now() + payload.expires_in * 1000)
      : null;

    await this.saveTokens({
      accessToken: payload.access_token,
      refreshToken,
      scope: payload.scope,
      tokenType: payload.token_type,
      expiryDate,
    });

    return payload.access_token;
  }
}
