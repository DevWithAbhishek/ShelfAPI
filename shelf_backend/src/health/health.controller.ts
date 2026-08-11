import { Controller, Get, Req } from '@nestjs/common';
import { HealthService } from './health.service';
import { type Request } from 'express';

@Controller('api/health')
export class HealthController {
    constructor(private healthService: HealthService) { }
    
    @Get()
    async checkHealth(@Req() req: Request) {
        return await this.healthService.check();
    }
}
