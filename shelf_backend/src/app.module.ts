import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DocsModule } from './docs/docs.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DocsService } from './docs/docs.service';
import { DocsController } from './docs/docs.controller';

@Module({
  imports: [UsersModule, DocsModule, HealthModule, AuthModule,ConfigModule.forRoot({isGlobal: true}), DocsModule],
  controllers: [AppController, AuthController, UsersController, DocsController],
  providers: [AppService, UsersService, AuthService, PrismaService, JwtService, DocsService],
})
export class AppModule {}
