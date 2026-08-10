import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check() {
    const dbHealthy = await this.prisma.$queryRaw`SELECT 1`;

    return {
      app: 'ok',
      database: dbHealthy ? 'ok' : 'down',
      timeStamp: new Date().toISOString().at,
    };
  }
}
