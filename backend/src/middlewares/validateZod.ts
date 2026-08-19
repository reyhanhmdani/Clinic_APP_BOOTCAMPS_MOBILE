import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import fs from 'fs';

export const validateZod = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      // misal gagal ketika melakukan sesuatu untuk upload file, gambar tetep tidak masuk ke folder public .. / mencegah masuk
      if ((req as any).file) {
        fs.unlinkSync((req as any).file.path);
      }
      if (error instanceof z.ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
};
