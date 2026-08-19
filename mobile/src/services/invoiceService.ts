import api from "../api/api";
import type { Invoice, PaymentMethod } from "../types/clinic";

export const getInvoiceService = async (): Promise<Invoice[]> => {
  const response = await api.get<{ data: Invoice[] }>("/invoices");
  return response.data.data;
};

export const createInvoiceService = async (data: { visitId: number }): Promise<Invoice> => {
  const response = await api.post<{ data: Invoice }>("/invoices", data);
  return response.data.data;
};

export interface PayInvoiceInput {
  paymentMethod?: PaymentMethod;
}

export const getInvoiceByIdService = async (invoiceId: number): Promise<Invoice> => {
  const response = await api.get<{ data: Invoice }>(`/invoices/${invoiceId}`);
  return response.data.data;
};

export const payInvoiceService = async (invoiceId: number, input?: PayInvoiceInput): Promise<Invoice> => {
  const response = await api.patch<{ data: Invoice }>(`/invoices/${invoiceId}`, input);
  return response.data.data;
};
