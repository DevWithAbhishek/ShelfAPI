import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
    @Get()
    findOne(): string{
        return 'Returns the user profile';
    }
}
