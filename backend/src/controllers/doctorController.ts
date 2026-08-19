import { Request, Response, NextFunction } from 'express';
import {
  createDoctorService,
  deleteDoctorService,
  getAllDoctorsService,
  getDoctorByIdService,
  updateDoctorService,
} from '../services/doctorService.js';

export const getAllDoctorsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctors = await getAllDoctorsService();

    return res.status(200).json({
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

export const createDoctorController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createDoctor = await createDoctorService(req.body);

    return res.status(201).json({
      message: `Berhasil Membuat Data baru dengan no ${createDoctor.id}`,
      data: createDoctor,
    });
  } catch (error) {
    next(error)
  }
};

export const getDoctorByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idDoctor } = req.params;

    const getDoctorById = await getDoctorByIdService(Number(idDoctor));

    return res.status(200).json({
      message: `Berhasil mengambil data Doctor dengan Id ${getDoctorById.id}`,
      data: getDoctorById,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctorController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idDoctor } = req.params;

    const updateDoctorById = await updateDoctorService(Number(idDoctor), req.body);

    return res.status(200).json({
      message: `Berhasil mengUpdate data Doctor dengan Id ${updateDoctorById.id}`,
      data: updateDoctorById,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctorController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idDoctor } = req.params;

    const deleteDoctorById = await deleteDoctorService(Number(idDoctor));

    return res.status(200).json({
      message: `Berhasil menghapus Doctor dengan id ${deleteDoctorById.id}`,
    });
  } catch (error) {
    next(error);
  }
};
