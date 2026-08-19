import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

export const authorization = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // pastikan user sudah ter autentikasi
    const user = (req as any).user;
    if (!user) {
      throw new ApiError(401, 'kamu belum login!!!!!');
    }
    // kalau udah login kita check apakah kamu adalah seorang user yang di izinkan masuk
    if (!allowedRoles.includes(user.role)) {
      throw new ApiError(403, 'hanya boleh di masuki user tertentu');
    }

    next();
  };
};
