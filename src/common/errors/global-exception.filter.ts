import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import AppBaseError from '../app-base.error';
import { exceptionMapping } from './exception-mapping';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url } = request;

    // Set default value
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let errorName = 'InternalServerError';
    let stack: string | undefined;

    if (exception instanceof AppBaseError) {
      // Custom application error
      status = exceptionMapping.get(exception.name) ?? HttpStatus.BAD_REQUEST;
      message = exception.message;
      errorName = exception.name;
    } else if (exception instanceof HttpException) {
      // NestJS framework error
      status = exception.getStatus();
      errorName = exception.name;
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message;

      if (status >= 500) stack = exception.stack;
    } else if (exception instanceof Error) {
      // Unknown runtime error
      errorName = exception.name;
      stack = exception.stack;
      if (!this.isProduction) message = exception.message;
    }

    if (status >= 500) {
      this.logger.error('Unhandled exception', {
        errorName,
        message,
        method,
        path: url,
        stack,
      });
    } else {
      this.logger.warn('Request Error', {
        errorName,
        message,
        method,
        path: url,
      });
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      error: {
        name: errorName,
        // Adds the stack trace to the client response, only if the server is in dev environment
        ...(stack && !this.isProduction && { stack }),
      },
    });
  }
}
