import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';

export const authentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'Token ga nemu, kalau belum login, silahkan login dulu');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    (req as any).user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, 'Token tidak valid!'));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, 'Token sudah expired! Silakan login ulang.'));
    }
    next(error);
  }
};
