import { z } from 'zod';
import { toTitleCase } from '../utils/formatter.js';

export const createDoctorSchema = z.object({
  name: z.string().min(1, 'Nama ga boleh kosong').transform(toTitleCase),
  spesialis: z.string().min(1, 'spesialis dokter apa? / g boleh kosong').transform(toTitleCase),
  fee: z.coerce.number().min(0, 'Fee nya ga boleh nol'),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;

export const updateDoctorSchema = createDoctorSchema.partial();
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
