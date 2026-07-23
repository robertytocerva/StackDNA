export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  details?: object;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';

  constructor(public override details: { field: string; reason: string }[]) {
    super('Parámetros de entrada inválidos');
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';

  constructor(message: string = 'Recurso no encontrado') {
    super(message);
  }
}

export class MethodNotAllowedError extends AppError {
  readonly statusCode = 405;
  readonly code = 'METHOD_NOT_ALLOWED';

  constructor(message: string = 'Método no permitido') {
    super(message);
  }
}

export class InternalError extends AppError {
  readonly statusCode = 500;
  readonly code = 'INTERNAL_ERROR';

  constructor(message: string = 'Error interno del servidor') {
    super(message);
  }
}
