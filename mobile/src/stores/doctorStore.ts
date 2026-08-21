import { create } from "zustand";
import { getDoctorService } from "../services/doctorService";
import { Doctor } from "../types/clinic";

interface DoctorState {
  doctors: Doctor[];
  loading: boolean;
  fetchDoctors: () => Promise<void>;
}

export const useDoctorStore = create<DoctorState>((set, get) => ({
  doctors: [],
  loading: false,

  fetchDoctors: async () => {
    set({ loading: true });
    try {
      const data = await getDoctorService();
      set({ doctors: data || [] });
    } catch (error) {
      console.log(error);
    } finally {
      set({ loading: false });
    }
  },
}));
