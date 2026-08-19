import { api } from "../api/api";
import type { Consultation } from "../types/clinic";

export interface CreateConsultationInput {
  visitId: number;
  complaint: string;
  diagnosis: string;
  notes?: string;
  medicine?: Array<{
    medicineId: number;
    qty: number;
    instructions?: string;
  }>;
}

export const createConsultationService = async (input: CreateConsultationInput): Promise<Consultation> => {
  const response = await api.post<{ data: Consultation }>("/consultations", input);
  return response.data.data;
};
