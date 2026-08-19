import { z } from 'zod';
import { toTitleCase } from '../utils/formatter.js';

export const createPatientSchema = z.object({
  name: z.string().min(1, 'Nama ga boleh kosong').transform(toTitleCase),
  gender: z.enum(['MALE', 'FEMALE']),
  age: z.coerce.number().min(0, 'umur ga boleh angka negatif'),
  phone: z.string().optional(),
  address: z
    .string()
    .optional()
    .transform((val) => (val ? toTitleCase(val) : undefined)),
});
export type CreatePatientInput = z.infer<typeof createPatientSchema>;

// menggunakan partial mengcopy yanga ada di create tapi jadi opsional semua isinya
export const updatePatientSchema = createPatientSchema.partial();
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;

// cara 2
// export const updatePatientSchema = z.object({
//   name: z
//     .string()
//     .optional()
//     .transform((val) => (val ? toTitleCase(val) : undefined)),
//   gender: z.enum(['MALE', 'FEMALE']).optional(),
//   age: z.coerce.number().min(0, 'umur ga boleh angka negatif').optional(),
//   phone: z.string().optional(),
//   address: z
//     .string()
//     .optional()
//     .transform((val) => (val ? toTitleCase(val) : undefined)),
// });
