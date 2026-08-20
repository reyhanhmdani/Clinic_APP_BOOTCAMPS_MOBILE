import prisma from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { CreateVisitInput, UpdateVisitInput } from "../validation/visitSchema.js";
import { getDoctorByIdService } from "./doctorService.js";
import { getPatientByIdService } from "./patientService.js";
import { VisitStatus } from "@prisma/client";

export const getAllVisitService = async () => {
  const visits = await prisma.visit.findMany({
    orderBy: {
      queueNumber: "desc",
    },
    include: {
      patient: true,
      doctor: true,
      invoice: true,
    },
  });

  if (visits.length === 0) {
    throw new ApiError(404, "Data Visit Kosong");
  }

  return visits;
};

export const createVisitService = async (input: CreateVisitInput) => {
  // cek apakah ada id pasien yang di pilih atau doctor
  const patient = await getPatientByIdService(input.patientId);
  const doctor = await getDoctorByIdService(input.doctorId);

  if (!doctor.isActive) {
    throw new ApiError(400, "Doctor yang dipilih sudah tidak aktif");
  }

  const visitDate = input.visitDate ?? new Date();

  const dateStr = visitDate.toISOString().split("T")[0];

  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.000Z`);

  // hitung antrian khusus di hari tersebut aja
  // const todayVisit = await prisma.visit.count({
  //   where: {
  //     visitDate: {
  //       gte: startOfDay,
  //       lte: endOfDay,
  //     },
  //   },
  // });

  const totalVisits = await prisma.visit.count();

  const queueNumber = totalVisits + 1;

  const createVisit = await prisma.visit.create({
    data: {
      patientId: input.patientId,
      doctorId: input.doctorId,
      visitDate: visitDate,
      queueNumber: queueNumber,
    },
  });

  return createVisit;
};

export const getVisitByIdService = async (id: number) => {
  const visit = await prisma.visit.findUnique({
    where: {
      id: id,
    },
  });

  if (!visit) {
    throw new ApiError(404, "Visit nya ga ada");
  }

  return visit;
};

export const updateVisitService = async (id: number, input: UpdateVisitInput) => {
  await getVisitByIdService(id);

  if (input.patientId) {
    await getPatientByIdService(input.patientId);
  }
  if (input.doctorId) {
    const doctor = await getDoctorByIdService(input.doctorId);
    if (!doctor.isActive) {
      throw new ApiError(400, "Dokter yang dipilih sedang tidak aktif");
    }
  }

  const updateData: any = { ...input };
  if (input.status === VisitStatus.IN_KONSULTASI) {
    updateData.checkInTime = new Date();
  }

  const updatedVisit = await prisma.visit.update({
    where: { id },
    data: updateData,
  });

  return updatedVisit;
};
