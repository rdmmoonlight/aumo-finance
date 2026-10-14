import type { NextFunction, Request, Response } from 'express';

interface BodyParserError {
  status: number;
  type: string;
}

function isBodyParserError(err: unknown): err is BodyParserError {
  return (
    typeof err === 'object' &&
    err !== null &&
    typeof (err as BodyParserError).status === 'number' &&
    typeof (err as BodyParserError).type === 'string'
  );
}

/**
 * Menangani error body-parser dengan format respons yang sama dengan filter global.
 * Dipasang tepat setelah body parser, sebelum Nest membungkus error-nya menjadi pesan bawaan Express.
 */
export function bodyParserErrorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!isBodyParserError(err)) return next(err);

  if (err.type === 'entity.too.large') {
    res.status(413).json({ success: false, message: 'Ukuran request terlalu besar' });
  } else if (err.type === 'entity.parse.failed') {
    res.status(400).json({ success: false, message: 'Format JSON tidak valid' });
  } else {
    res.status(err.status).json({ success: false, message: 'Request tidak valid' });
  }
}
