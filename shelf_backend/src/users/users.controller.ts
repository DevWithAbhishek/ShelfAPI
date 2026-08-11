import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
    constructor(private usersService: UsersService){}

    @Get()
    findOne(email: string ){
        return this.usersService.getUser(email);
    }
}
