export interface IError extends Error {
  statusCode: number;
}

abstract class AppError extends Error {
  constructor(
    message = "not found",
    options: ErrorOptions,
    public statusCode: number,
  ) {
    super(message, options);
  }
}

export class NotFoundExecption extends AppError {
  constructor(message = "not found", options: ErrorOptions = {}) {
    super(message, options, 404);
  }
}

export class BadReuestExecption extends AppError {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message, options, 400);
  }
}

export class UnauthorizedExecption extends AppError {
  constructor(message = "unauthorized", options: ErrorOptions = {}) {
    super(message, options, 401);
  }
}

export class ForbiddenExecption extends AppError {
  constructor(message = "forbidden", options: ErrorOptions = {}) {
    super(message, options, 403);
  }
}

export class ConflictExecption extends AppError {
  constructor(message = "conflict", options: ErrorOptions = {}) {
    super(message, options, 409);
  }
}

export class UnprocessableEntityExecption extends AppError {
  constructor(message = "unprocessable entity", options: ErrorOptions = {}) {
    super(message, options, 422);
  }
}

export class TooManyRequestsExecption extends AppError {
  constructor(message = "too many requests", options: ErrorOptions = {}) {
    super(message, options, 429);
  }
}

export class InternalServerErrorExecption extends AppError {
  constructor(message = "internal server error", options: ErrorOptions = {}) {
    super(message, options, 500);
  }
}

export class NotImplementedExecption extends AppError {
  constructor(message = "not implemented", options: ErrorOptions = {}) {
    super(message, options, 501);
  }
}

export class BadGatewayExecption extends AppError {
  constructor(message = "bad gateway", options: ErrorOptions = {}) {
    super(message, options, 502);
  }
}

export class ServiceUnavailableExecption extends AppError {
  constructor(message = "service unavailable", options: ErrorOptions = {}) {
    super(message, options, 503);
  }
}
