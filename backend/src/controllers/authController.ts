import { loginService } from '../services/authServices.js';
import { Request, Response, NextFunction } from 'express';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginService(req.body);

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
