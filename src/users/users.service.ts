import { Body, Injectable } from '@nestjs/common';
import { getUserDto } from './users.dto';

@Injectable()
export class UsersService {

    async getUser(getUserDto: getUserDto) {
        return 
    }
}
