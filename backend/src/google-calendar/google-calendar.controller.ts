import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { GoogleCalendarService } from "./google-calendar.service";

@Controller("google-calendar")
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get("connect")
  connect(@Res() res: Response) {
    return res.redirect(this.googleCalendarService.getConnectUrl());
  }

  @Get("status")
  getStatus() {
    return this.googleCalendarService.getStatus();
  }

  @Post("disconnect")
  disconnect() {
    return this.googleCalendarService.disconnect();
  }

  @Post("sync/:eventId")
  sync(@Param("eventId", ParseIntPipe) eventId: number) {
    return this.googleCalendarService.syncEvent(eventId);
  }
}

@Controller("auth/google")
export class GoogleOAuthController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get("callback")
  async callback(
    @Query("code") code: string | undefined,
    @Query("error") error: string | undefined,
    @Res() res: Response,
  ) {
    if (error) {
      return res.redirect(
        this.googleCalendarService.getFrontendRedirectUrl({
          google: "error",
          message: error,
        }),
      );
    }

    try {
      await this.googleCalendarService.completeOAuthCallback(code ?? "");
      return res.redirect(
        this.googleCalendarService.getFrontendRedirectUrl({
          google: "connected",
        }),
      );
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Falha ao concluir autenticacao Google";
      return res.redirect(
        this.googleCalendarService.getFrontendRedirectUrl({
          google: "error",
          message,
        }),
      );
    }
  }
}
