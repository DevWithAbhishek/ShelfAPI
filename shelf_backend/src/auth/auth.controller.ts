import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import {
  type loginDto,
  signup,
  type signupDto,
} from '../common/schemas/schema.zod';
import { ZodValidationPipe } from '../common/schemas/zod.schema';
import { authTokens } from './auth.dto';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from './auth.constants';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @UsePipes(new ZodValidationPipe(signup))
  async signup(@Body() signupDto: signupDto) {
    await this.authService.registerUser(signupDto);
    return { success: true, message: 'User created successfully' };
  }

  @Post('/login')
  async signin(
    @Body() loginDto: loginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(
      loginDto,
      req.ip,
      req.get('user-agent'),
    );
    this.setAuthCookies(res, tokens);
    return { message: 'Welcome to ShelfAPI' };
  }

  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshCookie = req.cookies?.shelf_refresh;

    const tokens = await this.authService.rotateTokens(refreshCookie);
    this.setAuthCookies(res, tokens);
    return { message: 'Tokens refreshed successfully' };
  }

  @Post('/logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshCookie = req.cookies?.shelf_refresh;
    await this.authService.logout(refreshCookie);
    this.clearAuthCookies(res);
    return {
      message: 'Logged out successfully',
    };
  }

  // Cookie Helpers
  private setAuthCookies(res: Response, tokens: authTokens) {
    // Access Token
    res.cookie('shelf_access', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_TTL,
      path: '/',
    });

    // Refresh Token
    // Cookie value: sessionId.refreshToken
    const refreshCookie = `${tokens.sessionId}.${tokens.refreshToken}`;
    res.cookie('shelf_refresh', refreshCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_TTL,
      path: '/auth',
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('shelf_access', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('shelf_refresh', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth',
    });
  }
}
