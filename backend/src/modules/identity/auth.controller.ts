import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto } from './auth.dto';
import { Public } from '../../shared/auth/public.decorator';
import { CurrentUser } from '../../shared/auth/current-user.decorator';
import * as Prisma from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(
      body.username,
      body.password,
      Boolean(body.rememberMe),
      res,
      {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    );
    return result;
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(req, res, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Public()
  @Get('me')
  me(@Req() req: Request & { user?: Prisma.User }) {
    if (!req.user) {
      return null;
    }
    return this.authService.me(req.user);
  }

  @Post('change-password')
  @HttpCode(204)
  async changePassword(
    @CurrentUser() user: Prisma.User,
    @Body() body: ChangePasswordDto,
    @Req() req: Request,
  ): Promise<void> {
    await this.authService.changePassword(
      user,
      body.currentPassword,
      body.newPassword,
      body.confirmNewPassword,
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] },
    );
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(req, res, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
