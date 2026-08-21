import api from "../api/api";
import type { Patient } from "../types/clinic";

export const getPatientService = async (): Promise<Patient[]> => {
  const response = await api.get<{ data: Patient[] }>("/patients");
  return response.data.data;
};

export const createPatientService = async (
  patientInput: Omit<Patient, "id" | "noRm">
): Promise<Patient> => {
  const response = await api.post<{ data: Patient }>("/patients", patientInput);
  return response.data.data;
};

export const getByIdPatientService = async (patientId: number): Promise<Patient> => {
  const response = await api.get<{ data: Patient }>(`/patients/${patientId}`);
  return response.data.data;
};
