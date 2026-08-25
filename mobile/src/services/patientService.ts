import api from "../api/api";
import type { Patient, Visit } from "../types/clinic";

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

export const getByIdPatientService = async (id: number): Promise<Patient> => {
  const response = await api.get<{ data: Patient }>(`/patients/${id}`);
  return response.data.data;
};

export const updatePatientService = async (
  id: number,
  input: Partial<Omit<Patient, "id" | "noRm">>
): Promise<Patient> => {
  const response = await api.patch<{ data: Patient }>(`/patients/${id}`, input);
  return response.data.data;
};

export const deletePatientService = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/patients/${id}`);
  return response.data;
};

export interface PatientHistoryResponse {
  patient: Patient;
  totalVisits: number;
  visits: Visit[];
}

export const getPatientHistoryService = async (
  id: number
): Promise<PatientHistoryResponse> => {
  const response = await api.get<{ data: PatientHistoryResponse }>(
    `/patients/${id}/history`
  );
  return response.data.data;
};
