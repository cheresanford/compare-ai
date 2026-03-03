import { Controller, Get, Post, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { GoogleIntegrationService } from "./google.service";
import { ConfigService } from "@nestjs/config";

@Controller("auth/google")
export class GoogleAuthController {
  constructor(
    private readonly googleIntegrationService: GoogleIntegrationService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  connect(@Res() res: Response) {
    const url = this.googleIntegrationService.getAuthUrl();
    return res.redirect(url);
  }

  @Get("callback")
  async callback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Res() res: Response,
  ) {
    const frontendUrl =
      this.configService.get<string>("FRONTEND_URL") ||
      "http://localhost:8082";

    if (!code) {
      return res.redirect(`${frontendUrl}?google=error`);
    }

    try {
      await this.googleIntegrationService.handleCallback(code, state);
      return res.redirect(`${frontendUrl}?google=connected`);
    } catch {
      return res.redirect(`${frontendUrl}?google=error`);
    }
  }

  @Get("status")
  async status() {
    return this.googleIntegrationService.getStatus();
  }

  @Post("logout")
  async logout() {
    return this.googleIntegrationService.disconnect();
  }
}
