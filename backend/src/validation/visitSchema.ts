import { VisitStatus } from '@prisma/client';
import { z } from 'zod';

export const createVisitSchema = z.object({
  patientId: z.coerce.number().min(1, 'ga boleh angka negatif dan 0, silahkan pilih id Pasien yang benar'),
  doctorId: z.coerce.number().min(1, 'ga boleh angka negatif dan 0, silahkan pilih id Doctor yang benar'),
  visitDate: z.coerce.date().optional(),
});

export type CreateVisitInput = z.infer<typeof createVisitSchema>;

export const updateVisitSchema = createVisitSchema
  .extend({
    status: z.nativeEnum(VisitStatus).optional(),
  })
  .partial();
export type UpdateVisitInput = z.infer<typeof updateVisitSchema>;
