import { z } from 'zod';

export const createConsultationSchema = z.object({
  visitId: z.coerce.number().min(1, 'angka ga boleh negatif dan 0, silahkan pilih id Visit yang benar'),
  complaint: z.string().min(1, 'harus ada complain yang di ajukan'),
  diagnosis: z.string().min(1, 'diagnosa tidak boleh kosong'),
  notes: z.string().optional(),
  consultationFee: z.coerce.number().min(0, 'Biaya konsultasi tidak boleh Negatif').default(50000),
  medicine: z
    .array(
      z.object({
        medicineId: z.coerce.number().min(1, 'Id obat tidak valid'),
        qty: z.coerce.number().min(1, 'Jumlah obat minimal 1 '),
        instructions: z.string().optional(),
      }),
    )
    .optional(),
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;

export const updateConsultationSchema = createConsultationSchema.partial();
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;
