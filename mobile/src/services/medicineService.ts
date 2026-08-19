import { api } from "../api/api";
import type { Medicine } from "../types/clinic";

// kenapa harus pakai Promise karne fungsinya bertype async di js/ts pasti auto mengembalikan Promise (karna hasil datanya baru tiba setelah request HTTP ke server selesai )
export const getMedicineService = async (): Promise<Medicine[]> => {
  const response = await api.get<{ data: Medicine[] }>("/medicines");
  return response.data.data;
};

export const createMedicineService = async (input: Omit<Medicine, "id" | "code">): Promise<Medicine> => {
  const response = await api.post<{ data: Medicine }>("/medicines", input);
  return response.data.data;
};

export const updateMedicineService = async (medicineId: number, input: Omit<Medicine, "id" | "code">): Promise<Medicine> => {
  const response = await api.patch<{ data: Medicine }>(`/medicines/${medicineId}`, input);
  return response.data.data;
};

export const deleteMedicineService = async (medicineId: number): Promise<Medicine> => {
  const response = await api.delete<{ data: Medicine }>(`/medicines/${medicineId}`);
  return response.data.data;
};
