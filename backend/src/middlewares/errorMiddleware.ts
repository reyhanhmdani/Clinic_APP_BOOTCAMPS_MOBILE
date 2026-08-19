import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // cek dlu apakah error ini adalah dari ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: false,
      message: err.message,
    });
  }

  // kalau bukan dari ApiError (error tak terduga / bug)
  console.log('error ga terduga', err);

  return res.status(500).json({
    status: false,
    message: 'Terjadi kesalahan pada server/codingan',
  });
};
