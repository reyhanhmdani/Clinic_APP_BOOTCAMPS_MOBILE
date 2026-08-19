import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { CreatePatientInput, UpdatePatientInput } from '../validation/patientSchema.js';
import { Prisma } from '@prisma/client';

export const getAllPatientsService = async () => {
  const patients = await prisma.patient.findMany({
    select: {
      id: true,
      name: true,
      noRm: true,
      gender: true,
      age: true,
      phone: true,
      address: true,
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

  const noRm = `RM-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

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
    throw new ApiError(404, 'patien nya ga ada ');
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
    throw new ApiError(404, 'patien yang ingin di update tidak di temukan');
  }

  const uptPatient = await prisma.patient.update({
    where: { id },
    data: input,
  });

  return uptPatient;
};

export const deletePatientService = async (id: number) => {
  const getPatient = await prisma.patient.findUnique({
    where: {
      id: id,
    },
  });
  if (!getPatient) {
    throw new ApiError(404, 'patien yang ingin di hapus nya tidak di temukan');
  }

  try {
    const deletePatient = await prisma.patient.delete({
      where: {
        id: id,
      },
    });
    return deletePatient;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new ApiError(400, 'Pasien tidak dapat dihapus karena memiliki riwayat rekam medis/kunjungan');
    }
    throw error;
  }
};
