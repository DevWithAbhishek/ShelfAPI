import { Injectable, Res } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {
  BadRequest,
  InvalidCredentials,
  InvalidTokens,
  Unauthenticated,
} from '../common/errors/errors-class.error';
import { hashByArgon2, verifyByArgon } from './auth.hashing';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';
import { REFRESH_TOKEN_TTL } from './auth.constants';
import type { Response } from 'express';
import { type loginDto, type signupDto } from '../common/schemas/schema.zod';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // REGISTER
  async registerUser(signupDto: signupDto) {
    try {
      const existingUser = await this.usersService.getUser(signupDto.email);
      const password = signupDto.password ?? 'Dummy';
      const passwordHash = await hashByArgon2(password);

      if (existingUser) throw new InvalidCredentials();

      await this.prisma.user.create({
        data: {
          email: signupDto.email,
          hashed_password: passwordHash,
          username: signupDto.name,
        },
      });
    } catch (err) {
      throw new BadRequest(err);
    }
  }

  // LOGIN
  async login(loginDto: loginDto, ip?: string, userAgent?: string) {
    try {
      const user = await this.usersService.getUser(loginDto.email);
      if (!user) throw new InvalidCredentials();

      const validPassword = await verifyByArgon(
        user.hashed_password,
        loginDto.password,
      );
      if (!validPassword) throw new InvalidCredentials();

      const payload = { sub: user.id, username: user.username };
      const accessToken = await this.jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      });

      const refreshToken = crypto.randomBytes(32).toString('base64url');
      const refreshTokenHash = await hashByArgon2(refreshToken);
      const family = crypto.randomBytes(24).toString('hex');

      const session = await this.prisma.session.create({
        data: {
          family,
          token_hash: refreshTokenHash,
          ip: ip ?? null,
          user_agent: userAgent ?? null,
          last_seen_ip: ip ?? null,
          user_id: user.id,
          expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL),
        },
      });
      return { accessToken, refreshToken, sessionId: session.id };
    } catch (err) {
      throw new BadRequest(err);
    }
  }

  // ROTATE TOKENS
  async rotateTokens(refreshCookie: string) {
    if (!refreshCookie) throw new Unauthenticated();
    const separatorIndex = refreshCookie.indexOf('.');
    if (separatorIndex === -1) throw new InvalidTokens();

    const sessionId = refreshCookie.slice(0, separatorIndex);
    const rawRefreshToken = refreshCookie.slice(separatorIndex + 1);
    if (!sessionId || !rawRefreshToken) throw new InvalidTokens();

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new InvalidTokens();
    if (session.revoked_at || session.expires_at < new Date(Date.now()))
      throw new InvalidTokens();

    const validToken = await verifyByArgon(session.token_hash, rawRefreshToken);
    if (!validToken) {
      await this.prisma.session.updateMany({
        where: {
          family: session.family,
          revoked_at: null,
        },
        data: {
          revoked_at: new Date(),
        },
      });

      throw new InvalidTokens();
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.user_id },
    });
    if (!user) throw new Unauthenticated();

    const payload = { sub: user.id, username: user.username };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const newRefreshToken = crypto.randomBytes(32).toString('base64url');
    const newRefreshTokenHash = await hashByArgon2(newRefreshToken);

    await this.prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        token_hash: newRefreshTokenHash,
        last_seen_ip: session.ip,
        revoked_at: null,
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      sessionId: session.id,
    };
  }

  // LOGOUT
  async logout(refreshCookie?: string) {
    try {
      if (!refreshCookie) return;
      const separatorIndex = refreshCookie.indexOf('.');
      if (separatorIndex === -1) return;

      const sessionId = refreshCookie.slice(0, separatorIndex);
      const rawRefreshToken = refreshCookie.slice(separatorIndex + 1);
      if (!sessionId || !rawRefreshToken) return;

      const session = await this.prisma.session.findUnique({
        where: {
          id: sessionId,
        },
      });
      if (!session) return;

      const validToken = await verifyByArgon(
        session.token_hash,
        rawRefreshToken,
      );
      if (!validToken) return;

      await this.prisma.session.update({
        where: {
          id: session.id,
        },
        data: {
          revoked_at: new Date(),
        },
      });
    } catch (err) {
      throw new BadRequest(err);
    }
  }
}
