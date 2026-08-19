import { z } from 'zod';

// cara lama
// export interface LoginInput {
//   email: string;
//   password: string;
// }

export const loginSchema = z.object({
  email: z.email('format tidak valid'),
  password: z.string().min(1, 'password ga boleh kosong'),
});

// typescript otomatis mengambil tipe data dari login schema 
export type LoginInput = z.infer<typeof loginSchema>