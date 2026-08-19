import { api } from "../api/api";
import type { Visit, VisitStatus } from "../types/clinic";

export interface visitInput {
  patientId: number;
  doctorId: number;
}

export interface UpdateVisitInput {
  patientId?: number;
  doctorId?: number;
  status?: VisitStatus;
}
export const getVisitService = async (): Promise<Visit[]> => {
  const response = await api.get<{ data: Visit[] }>("/visits");
  return response.data.data;
};

export const createVisitService = async (input: visitInput): Promise<Visit> => {
  const response = await api.post<{ data: Visit }>("/visits", input);
  return response.data.data;
};

export const getVisitByIdService = async (visitId: number): Promise<Visit> => {
  const response = await api.get<{ data: Visit }>(`/visits/${visitId}`);
  return response.data.data;
};

export const updateVisitService = async (visitId: number, input: UpdateVisitInput): Promise<Visit> => {
  const response = await api.patch<{ data: Visit }>(`/visits/${visitId}`, input);
  return response.data.data;
};

export const cancelVisitService = async (visitId: number): Promise<Visit> => {
  return updateVisitService(visitId, { status: "CANCELLED" });
};
