import { Body, Controller, Post } from '@nestjs/common';
import { signupDto } from './auth.dto';

@Controller('auth')
export class AuthController {
    @Post("/signup")
    createUser(@Body() signupDto: signupDto) {
        return "User created successfully";
    }
}
