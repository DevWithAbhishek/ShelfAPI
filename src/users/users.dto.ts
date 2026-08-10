import { IsEmail } from "class-validator";

export class getUserDto{
    @IsEmail()
    email: string;
}

