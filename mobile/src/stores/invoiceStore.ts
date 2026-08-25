import { create } from "zustand";
import { getInvoiceService } from "../services/invoiceService";
import { Invoice } from "../types/clinic";

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  fetchInvoices: () => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  loading: false,

  fetchInvoices: async () => {
    set({ loading: true });
    try {
      const data = await getInvoiceService();
      set({ invoices: data || [] });
    } catch (error) {
      console.log(error);
    } finally {
      set({ loading: false });
    }
  },
}));
