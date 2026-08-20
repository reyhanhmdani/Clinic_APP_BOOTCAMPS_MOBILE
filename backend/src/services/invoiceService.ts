import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { CreateInvoiceInput, payInvoiceInput } from '../validation/invoiceSchema.js';
import { getVisitByIdService } from './visitService.js';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

const invoiceSelectPayload = {
  // 1. Field Utama Invoice (Faktur Kasir)
  id: true,
  invoiceNo: true,
  totalConsultationFee: true,
  totalMedicineFee: true,
  totalAmount: true,
  status: true,
  paymentMethod: true,
  paidAt: true,
  createdAt: true,

  // 2. Relasi ke Visit (Data Pasien, Dokter, Diagnosa, & Rincian Obat)
  visit: {
    select: {
      id: true,
      visitDate: true,
      patient: {
        select: {
          id: true,
          noRm: true,
          name: true,
          phone: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          spesialis: true,
        },
      },
      consultation: {
        select: {
          id: true,
          complaint: true,
          diagnosis: true,
          notes: true,
          consultationMedicines: {
            select: {
              id: true,
              qty: true,
              price: true,
              subTotal: true,
              instructions: true,
              medicine: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  unit: true,
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const getAllInvoiceService = async () => {
  const invoices = await prisma.invoice.findMany({
    select: {
      id: true,
      invoiceNo: true,
      totalConsultationFee: true,
      totalMedicineFee: true,
      totalAmount: true,
      status: true,
      paymentMethod: true,
      paidAt: true,
      visit: {
        select: {
          patient: { select: { name: true } },
          doctor: { select: { name: true } },
        },
      },
    },
  });

  if (invoices.length === 0) {
    throw new ApiError(404, 'Invoice nya kosong');
  }

  return invoices;
};

export const createInvoiceService = async (input: CreateInvoiceInput) => {
  await getVisitByIdService(input.visitId);

  // cek dlu apakah pasien sudah punya dokter
  const consultation = await prisma.consultation.findUnique({
    where: { visitId: input.visitId },
    include: { consultationMedicines: true },
  });

  if (!consultation) {
    throw new ApiError(404, 'Pasien ini belum di periksa oleh Dokter');
  }

  //cek apakah invoice sudah pernah di buat sebelumnya
  const existingInvoice = await prisma.invoice.findUnique({
    where: { visitId: input.visitId },
  });

  if (existingInvoice) {
    throw new ApiError(400, 'Invoice ini sudah pernah dibuat sebelumnya');
  }

  const totalConsultationFee = Number(consultation.consultationFee);
  const totalMedicineFee = consultation.consultationMedicines.reduce((sum, item) => sum + Number(item.subTotal), 0);
  const totalAmount = totalConsultationFee + totalMedicineFee;

  const countAll = await prisma.invoice.count();
  const invoiceNo = `INV-${String(countAll + 1).padStart(4, '0')}`;

  const createInvoice = await prisma.invoice.create({
    data: {
      visitId: input.visitId,
      invoiceNo: invoiceNo,
      totalConsultationFee: totalConsultationFee,
      totalMedicineFee: totalMedicineFee,
      totalAmount: totalAmount,
      paymentMethod: input.paymentMethod ?? PaymentMethod.CASH,
    },
  });

  return createInvoice;
};

export const getInvoiceByIdService = async (id: number) => {
  const getInvoice = await prisma.invoice.findUnique({
    where: { id },
    select: invoiceSelectPayload,
  });

  if (!getInvoice) {
    throw new ApiError(404, 'Data Invoice tidak di temukan');
  }

  return getInvoice;
};

export const payInvoiceService = async (id: number, input?: payInvoiceInput) => {
  const invoice = await getInvoiceByIdService(id);

  if (invoice.status === InvoiceStatus.PAID) {
    throw new ApiError(400, 'Invoice ini sudah lunas sebelumnya');
  }

  const payInvoice = await prisma.invoice.update({
    where: { id },
    data: {
      status: InvoiceStatus.PAID,
      paidAt: new Date(),
      // Update paymentMethod jika kasir memilih metode bayar baru
      paymentMethod: input?.paymentMethod ?? invoice.paymentMethod,
    },
  });
  return payInvoice;
};
