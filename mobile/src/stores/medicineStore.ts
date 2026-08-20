import { create } from "zustand";
import { getMedicineService, updateMedicineService, createMedicineService, deleteMedicineService } from "../services/medicineService";
import { Medicine } from "../types/clinic";

interface MedicineState {
  medicines: Medicine[];
  loading: boolean;
  fetchMedicines: () => Promise<void>;
}

export const useMedicineStore = create<MedicineState>((set, get) => ({
  medicines: [],
  loading: false,

  fetchMedicines: async () => {
    set({ loading: true });
    try {
      const data = await getMedicineService();
      set({ medicines: data || [] });
    } catch (error) {
      console.log(error);
    } finally {
      set({ loading: false });
    }
  },
}));
