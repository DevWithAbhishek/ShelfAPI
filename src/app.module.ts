import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DocsModule } from './docs/docs.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, DocsModule, HealthModule, AuthModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
