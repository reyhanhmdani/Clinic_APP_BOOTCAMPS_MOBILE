import { create } from "zustand";
import { getPatientService } from "../services/patientService";
import { Patient } from "../types/clinic";

interface PatientState {
  patients: Patient[];
  loading: boolean;
  fetchPatients: () => Promise<void>;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [],
  loading: false,

  fetchPatients: async () => {
    set({ loading: true });
    try {
      const data = await getPatientService();
      set({ patients: data || [] });
    } catch (error) {
      console.log(error);
    } finally {
      set({ loading: false });
    }
  },
}));
