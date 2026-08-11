import { HttpStatus } from "@nestjs/common";

export const exceptionMapping = new Map<string, HttpStatus>([
    ['InvalidCredentials', HttpStatus.UNAUTHORIZED],
    ['Unauthenticated', HttpStatus.UNAUTHORIZED],
    ['ValidationFailed', HttpStatus.UNPROCESSABLE_ENTITY],
    ['BadRequest', HttpStatus.BAD_REQUEST],
    ['InvalidTokens', HttpStatus.FORBIDDEN],
    ['FileMissing', HttpStatus.BAD_REQUEST],
])