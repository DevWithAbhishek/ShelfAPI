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

@Module({
  imports: [UsersModule, DocsModule, HealthModule, AuthModule,ConfigModule.forRoot({isGlobal: true})],
  controllers: [AppController, AuthController, UsersController],
  providers: [AppService, UsersService, AuthService, PrismaService],
})
export class AppModule {}
