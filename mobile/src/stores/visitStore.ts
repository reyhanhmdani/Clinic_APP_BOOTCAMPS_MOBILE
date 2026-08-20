import { create } from "zustand";
import { getVisitService, updateVisitService } from "../services/visitService";
import { Visit } from "../types/clinic";

interface VisitState {
  visits: Visit[];
  loading: boolean;
  fetchVisits: () => Promise<void>;
  callPatient: (visitId: number) => Promise<void>;
}

export const useVisitStore = create<VisitState>((set, get) => ({
  visits: [],
  loading: false,

  fetchVisits: async () => {
    set({ loading: true });
    try {
      const data = await getVisitService();
      set({ visits: data || [] });
    } catch (error) {
      console.log(error);
    } finally {
      set({ loading: false });
    }
  },

  callPatient: async (visitId: number) => {
    // update status visit nya, tetapi di layar masih pakai data lama
    await updateVisitService(visitId, { status: "IN_KONSULTASI" });
    // setelah di update statusnya, biar tampilan di hp langsung berubah auto dengan data terbaru
    await get().fetchVisits();
  },
}));
