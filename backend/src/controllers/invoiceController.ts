import { Request, Response, NextFunction } from 'express';
import {
  createInvoiceService,
  getAllInvoiceService,
  getInvoiceByIdService,
  payInvoiceService,
} from '../services/invoiceService.js';

export const getAllInvoiceController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices = await getAllInvoiceService();
    return res.status(200).json({
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

export const createInvoiceController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createInvoice = await createInvoiceService(req.body);

    return res.status(201).json({
      message: 'Berhasil membuat invoice',
      data: createInvoice,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idInvoice } = req.params;
    const getInvoice = await getInvoiceByIdService(Number(idInvoice));

    return res.status(200).json({
      message: `Berhasil mengambil data Invoice dengan Id ${getInvoice.id}`,
      data: getInvoice,
    });
  } catch (error) {
    next(error);
  }
};

export const payInvoiceController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idInvoice } = req.params;
    const payInvoice = await payInvoiceService(Number(idInvoice), req.body);

    return res.status(200).json({
      message: 'Berhasil melakukan pembayaran invoice',
      data: payInvoice,
    });
  } catch (error) {
    next(error);
  }
};
