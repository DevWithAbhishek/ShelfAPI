import { Body, Injectable } from '@nestjs/common';
import { signupDto } from './auth.dto';

@Injectable()
export class AuthService {
    
    async registerUser(signupDto: signupDto) {
        /**
         * 1. Find if email exists in DB
         * 2. Hash password
         * 3. If email found, return 401
         * 4. Store in DB
         */
    }
}
