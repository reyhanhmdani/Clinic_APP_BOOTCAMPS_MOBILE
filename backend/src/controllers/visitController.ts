import { Request, Response, NextFunction } from 'express';
import {
  createVisitService,
  getAllVisitService,
  getVisitByIdService,
  updateVisitService,
} from '../services/visitService.js';

export const getAllVisitController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const visits = await getAllVisitService();

    return res.status(200).json({
      data: visits,
    });
  } catch (error) {
    next(error);
  }
};

export const createVisitController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createVisit = await createVisitService(req.body);

    return res.status(201).json({
      message: `Berhasil Membuat Data baru dengan Id ${createVisit.id}`,
      data: createVisit,
    });
  } catch (error) {
    next(error);
  }
};

export const getVisitByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idVisit } = req.params;
    const getVisit = await getVisitByIdService(Number(idVisit));

    return res.status(200).json({
      message: `Berhasil mengambil data Visit dengan Id ${getVisit.id}`,
      data: getVisit,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVisitController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idVisit } = req.params;

    const updateVisit = await updateVisitService(Number(idVisit), req.body);

    return res.status(200).json({
      message: `Berhasil mengUpdate data Visit dengan Id ${updateVisit.id}`,
      data: updateVisit,
    });
  } catch (error) {
    next(error);
  }
};
