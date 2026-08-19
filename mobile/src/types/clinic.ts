export type Role = "ADMIN" | "CUSTOMERS";
export type Gender = "MALE" | "FEMALE";
export type VisitStatus = "WAITING" | "IN_KONSULTASI" | "COMPLETED" | "CANCELLED";
export type InvoiceStatus = "PAID" | "UNPAID" | "CANCELLED";
export type PaymentMethod = "QRIS" | "CASH" | "TRANSFER" | "CARD";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: Role;
}

export interface Patient {
  id: number;
  noRm: string;
  name: string;
  gender: Gender;
  age: number;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface Doctor {
  id: number;
  name: string;
  spesialis: string;
  phone?: string;
  fee: number;
  isActive: boolean;
  room?: string;
  currentVisitStatus?: VisitStatus;
  createdAt?: string;
}

export interface Visit {
  id: number;
  patientId: number;
  doctorId: number;
  queueNumber: number;
  visitDate: string;
  status: VisitStatus;
  checkInTime?: string;
  createdAt?: string;
  updatedAt?: string;
  patient?: Patient;
  doctor?: Doctor;
  consultation?: Consultation;
  invoice?: Invoice;
}

export interface Consultation {
  id: number;
  visitId: number;
  complaint: string;
  diagnosis: string;
  notes?: string;
  consultationFee: number;
  createdAt?: string;
  visit?: Visit;
  consultationMedicines?: ConsultationMedicine[];
}

export interface Medicine {
  id: number;
  code: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
  createdAt?: string;
}

export interface ConsultationMedicine {
  id: number;
  consultationId: number;
  medicineId: number;
  qty: number;
  price: number;
  subTotal: number;
  instructions?: string;
  createdAt?: string;
  consultation?: Consultation;
  medicine?: Medicine;
}

export interface Invoice {
  id: number;
  visitId: number;
  invoiceNo: string;
  totalConsultationFee: number;
  totalMedicineFee: number;
  totalAmount: number;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  paidAt?: string;
  createdAt?: string;
  visit?: Visit;
}

// Frontend Dashboard DTO Helpers
export interface QueueItemDTO {
  visitId: number;
  queueToken: string;
  noRm: string;
  patientName: string;
  arrivalTime: string;
  visitStatus: VisitStatus;
  invoiceStatus?: InvoiceStatus;
  doctorName: string;
  doctorInitials: string;
  actionType: "CALL_PATIENT" | "PROCESS_PAYMENT" | "CHECK_IN" | "VIEW_DETAILS";
}

export interface DashboardStats {
  totalCheckedIn: number;
  currentlyWaiting: number;
  awaitingPayment: number;
  todayEstimatedRevenue: number;
  completedVisits: number;
  checkedInGrowth?: number;
  avgWaitTimeMinutes?: number;
  awaitingPaymentGrowth?: number;
}

export interface DashboardContextType {
  doctors: Doctor[];
  patients: Patient[];
  visits: Visit[];
  stats: DashboardStats;
  isLoading: boolean;
  apiError: string | null;
  refreshData: () => Promise<void>;
  setIsVisitModalOpen: (open: boolean) => void;
}
