import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ValidationError } from 'class-validator';

function flattenValidation(errors: ValidationError[], parent = ''): string[] {
  const out: string[] = [];
  for (const err of errors) {
    const path = parent ? `${parent}.${err.property}` : err.property;
    if (err.constraints) {
      out.push(...Object.values(err.constraints).map((m) => `${path}: ${m}`));
    }
    if (err.children?.length) {
      out.push(...flattenValidation(err.children, path));
    }
  }
  return out;
}

/** Nest ValidationPipe default body has no `detail`; FE falls back to "Request failed". */
export function validationExceptionFactory(errors: ValidationError[]) {
  const messages = flattenValidation(errors);
  return new BadRequestException({
    title: 'Bad Request',
    status: 400,
    code: 'VALIDATION_FAILED',
    detail: messages.join('; ') || 'Validation failed',
    errors: messages.map((message) => ({ field: '', message })),
  });
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        res.status(status).json({
          title: HttpStatus[status] ?? 'Error',
          status,
          detail: body,
        });
        return;
      }
      const obj = body as Record<string, unknown>;
      if (obj.detail || obj.title) {
        res.status(status).json(obj);
        return;
      }
      const message = obj.message;
      const detail = Array.isArray(message)
        ? message.join('; ')
        : typeof message === 'string'
          ? message
          : exception.message;
      res.status(status).json({
        title: (obj.error as string) ?? 'Error',
        status,
        code: obj.code,
        detail,
      });
      return;
    }

    console.error(exception);
    res.status(500).json({
      title: 'Internal Server Error',
      status: 500,
      code: 'INTERNAL_ERROR',
      detail: 'An unexpected error occurred',
    });
  }
}
