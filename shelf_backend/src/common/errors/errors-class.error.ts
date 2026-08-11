import AppBaseError from "../app-base.error";

export class InvalidCredentials extends AppBaseError{
    constructor() {
        super(`Invalid email or password`);
    }
}

export class Unauthenticated extends AppBaseError{
    constructor() {
        super('Unauthenticated Request');
    }
}

export class ValidationFailed extends AppBaseError{
    constructor() {
        super('Invalid input - please check the fields');
    }
}

export class BadRequest extends AppBaseError{
    constructor(error: any) {
        super(`Bad Request: ${error}`);
    }
}

export class InvalidTokens extends AppBaseError{
    constructor() {
        super(`Invalid tokens received`);
    }
}

export class FileMissing extends AppBaseError {
    constructor() {
        super(`No file found in request. Please check and try again`);
    }
}