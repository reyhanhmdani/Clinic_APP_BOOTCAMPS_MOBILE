import { Request, Response, NextFunction } from 'express';
import { log } from 'node:console';

export const logger = async (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // tunggu response selesai di kirim, lalu hitung durasinya
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.url} → ${res.statusCode} (${duration}ms)`);
  });

  next();
};
