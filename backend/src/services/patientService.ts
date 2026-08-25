import prisma from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { CreatePatientInput, UpdatePatientInput } from "../validation/patientSchema.js";
import { Prisma } from "@prisma/client";

export const getAllPatientsService = async () => {
  const patients = await prisma.patient.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      noRm: true,
      gender: true,
      age: true,
      phone: true,
      address: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (patients.length === 0) {
    return [];
    // throw new ApiError(404, 'Data Patient KOSONG');
  }
  return patients;
};

export const createPatientService = async (input: CreatePatientInput) => {
  const year = new Date().getFullYear();

  const count = await prisma.patient.count({
    where: { noRm: { startsWith: `RM-${year}` } },
  });

  const noRm = `RM-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

  const newPatient = await prisma.patient.create({
    data: {
      name: input.name,
      noRm: noRm,
      gender: input.gender,
      age: input.age,
      phone: input.phone ?? null,
      address: input.address ?? null,
    },
  });

  return newPatient;
};

export const getPatientByIdService = async (id: number) => {
  const patient = await prisma.patient.findUnique({
    where: {
      id: id,
    },
  });

  if (!patient) {
    throw new ApiError(404, "patien nya ga ada ");
  }

  return patient;
};

export const updatePatientService = async (id: number, input: UpdatePatientInput) => {
  const patient = await prisma.patient.findUnique({
    where: {
      id: id,
    },
  });

  if (!patient) {
    throw new ApiError(404, "patien yang ingin di update tidak di temukan");
  }

  const uptPatient = await prisma.patient.update({
    where: { id },
    data: input,
  });

  return uptPatient;
};

export const deletePatientService = async (id: number) => {
  await getPatientByIdService(id);

  //  Cek apakah pasien memiliki riwayat kunjungan / rekam medis
  const hasVisits = await prisma.visit.findFirst({
    where: { patientId: id },
  });

  if (hasVisits) {
    throw new ApiError(
      400,
      "Pasien tidak dapat dihapus karena memiliki riwayat rekam medis/kunjungan"
    );
  }

  //  Eksekusi hapus jika tidak ada riwayat
  return await prisma.patient.delete({
    where: { id },
  });
};

export const getPatientHistoryService = async (id: number) => {
  const patient = await getPatientByIdService(id);

  // Ambil semua riwayat kunjungan pasien dari yang terbaru
  const visits = await prisma.visit.findMany({
    where: { patientId: id },
    orderBy: { visitDate: "desc" },
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          spesialis: true,
        },
      },
      consultation: {
        include: {
          consultationMedicines: {
            include: {
              medicine: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  unit: true,
                },
              },
            },
          },
        },
      },
      invoice: {
        select: {
          id: true,
          invoiceNo: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          paidAt: true,
        },
      },
    },
  });

  return {
    patient,
    totalVisits: visits.length,
    visits,
  };
}; 