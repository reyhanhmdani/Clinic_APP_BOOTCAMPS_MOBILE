import { Request, Response, NextFunction } from "express";
import {
  createPatientService,
  deletePatientService,
  getAllPatientsService,
  getPatientByIdService,
  getPatientHistoryService,
  updatePatientService,
} from "../services/patientService.js";

export const getAllPatientsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patients = await getAllPatientsService();

    return res.status(200).json({
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

export const createPatientController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createPatient = await createPatientService(req.body);

    return res.status(201).json({
      message: `Data Pasien dengan Nama ${createPatient.name} Sudah Berhasil di Buat`,
      data: createPatient,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPatient } = req.params;

    const getPatientById = await getPatientByIdService(Number(idPatient));

    return res.status(200).json({
      message: `Berhasil mengambil data pasien dengan id ${getPatientById.id}`,
      data: getPatientById,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePatientController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPatient } = req.params;
    const updatePatient = await updatePatientService(Number(idPatient), req.body);

    return res.status(200).json({
      message: `Berhasil mengUpdate data pasien dengan Id ${updatePatient.id}`,
      data: updatePatient,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePatientController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPatient } = req.params;

    const deletePatient = await deletePatientService(Number(idPatient));

    return res.status(200).json({
      message: `Berhasil menghapus pasien dengan id ${deletePatient.id}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idPatient } = req.params;
    const history = await getPatientHistoryService(Number(idPatient));

    return res.status(200).json({
      message: `Berhasil mengambil riwayat rekam medis pasien`,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
