import { Request, Response, NextFunction } from 'express';
import {
  createMedicineService,
  deleteMedicineService,
  getAllMedicineService,
  getMedicineByIdService,
  updateMedicineService,
} from '../services/medicineService.js';

export const getAllMedicineController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const medicine = await getAllMedicineService();

    return res.status(200).json({
      message: 'Berhasil',
      data: medicine,
    });
  } catch (error) {
    next(error);
  }
};

export const createMedicineController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createMedicine = await createMedicineService(req.body);

    return res.status(201).json({
      message: `Berhasil Membuat Data baru dengan no ${createMedicine.id}`,
      data: createMedicine,
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicineByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idMedicine } = req.params;
    const getMedicine = await getMedicineByIdService(Number(idMedicine));

    return res.status(200).json({
      message: `Berhasil mengambil data medicine dengan Id ${getMedicine.id}`,
      data: getMedicine,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMedicineController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idMedicine } = req.params;
    const updateMedicine = await updateMedicineService(Number(idMedicine), req.body);

    return res.status(200).json({
      message: `Berhasil mengUpdate data medicine dengan Id ${updateMedicine.id}`,
      data: updateMedicine,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMedicineController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idMedicine } = req.params;
    const deleteMedicine = await deleteMedicineService(Number(idMedicine));

    return res.status(200).json({
      message: `Berhasil menghapus medicine dengan id ${deleteMedicine.id}`,
    });
  } catch (error) {
    next(error);
  }
};
