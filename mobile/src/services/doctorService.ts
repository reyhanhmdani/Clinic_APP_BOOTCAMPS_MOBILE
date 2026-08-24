import api from "../api/api";
import type { Doctor } from "../types/clinic";

export const getDoctorService = async (): Promise<Doctor[]> => {
  const response = await api.get<{ data: Doctor[] }>("/doctors");
  return response.data.data;
};

export const createDoctorService = async (
  input: Omit<Doctor, "id" | "createdAt">
): Promise<Doctor> => {
  const response = await api.post<{ data: Doctor }>("/doctors", input);
  return response.data.data;
};

export const getDoctorByIdService = async (id: number): Promise<Doctor> => {
  const response = await api.get<{ data: Doctor }>(`/doctors/${id}`);
  return response.data.data;
};

export const updateDoctorService = async (
  id: number,
  input: Partial<Omit<Doctor, "id" | "createdAt">>
): Promise<Doctor> => {
  const response = await api.patch<{ data: Doctor }>(`/doctors/${id}`, input);
  return response.data.data;
};

// export interface updateStatusDoctor {
//   isActive?:
// }
export const deleteDoctorService = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/doctors/${id}`);
  return response.data;
};
