import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { STATUS_CODES } from 'http';

interface ErrorResponseBody {
  success: false;
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const { statusCode, error, message } = this.normalize(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponseBody = {
      success: false,
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    void response.status(statusCode).send(body);
  }

  private normalize(exception: unknown): {
    statusCode: number;
    error: string;
    message: string | string[];
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const payload = exception.getResponse();
      const reason = STATUS_CODES[statusCode] ?? exception.name;

      if (typeof payload === 'string') {
        return { statusCode, error: reason, message: payload };
      }

      const record = payload as Record<string, unknown>;
      return {
        statusCode,
        error: (record.error as string) ?? reason,
        message: (record.message as string | string[]) ?? exception.message,
      };
    }

    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    return {
      statusCode,
      error: STATUS_CODES[statusCode] ?? 'Internal Server Error',
      message: 'Internal server error',
    };
  }
}
