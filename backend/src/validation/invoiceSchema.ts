import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const createInvoiceSchema = z.object({
  visitId: z.coerce.number().min(1, 'angka ga boleh negatif dan 0, silahkan pilih id Visit yang benar'),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const payInvoiceSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
});

export type payInvoiceInput = z.infer<typeof payInvoiceSchema>;
