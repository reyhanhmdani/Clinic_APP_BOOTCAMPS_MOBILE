import { Request, Response, NextFunction } from 'express';
import {
  createConsultationService,
  getAllConsultationService,
  getConsultationByIdService,
  updateConsultationService,
} from '../services/consultationService.js';

export const getAllConsultationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consultations = await getAllConsultationService();

    return res.status(200).json({
      data: consultations,
    });
  } catch (error) {
    next(error);
  }
};

export const createConsultationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createConsultation = await createConsultationService(req.body);

    return res.status(201).json({
      message: `Berhasil Membuat Data baru dengan id ${createConsultation.id}`,
      data: createConsultation,
    });
  } catch (error) {
    next(error);
  }
};

export const getConsultationByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idConsultation } = req.params;

    const getConsultation = await getConsultationByIdService(Number(idConsultation));

    return res.status(200).json({
      message: `Berhasil mengambil data Konsultasi dengan id ${getConsultation.id}`,
      data: getConsultation,
    });
  } catch (error) {
    next(error);
  }
};

export const updateConsultationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idConsultation } = req.params;

    const updateConsultation = await updateConsultationService(Number(idConsultation), req.body);

    return res.status(200).json({
      message: `Berhasil mengUpdate data Konsultasi dengan Id ${updateConsultation.id}`,
      data: updateConsultation,
    });
  } catch (error) {
    next(error);
  }
};
