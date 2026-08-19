import { z } from 'zod';
import { toTitleCase } from '../utils/formatter.js';

export const createMedicineSchema = z.object({
  name: z.string().min(1, 'Nama medicine nya ga boleh kosong').transform(toTitleCase),
  price: z.coerce.number().min(0, 'harga tidak boleh negatif'),
  stock: z.coerce.number().min(0, 'stock ga boleh negatif'),
  unit: z.string().min(1, 'Nama unit ga boleh kosong').transform(toTitleCase),
});

export type createMedicineInput = z.infer<typeof createMedicineSchema>;

export const updateMedicineSchema = createMedicineSchema.partial();
export type updateMedicineInput = z.infer<typeof updateMedicineSchema>;
