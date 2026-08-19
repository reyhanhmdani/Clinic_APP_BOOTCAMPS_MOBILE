import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { CreateDoctorInput, UpdateDoctorInput } from '../validation/doctorSchema.js';
import { Prisma } from '@prisma/client';

export const getAllDoctorsService = async () => {
  const doctors = await prisma.doctor.findMany({
    orderBy: { id: 'desc' },
  });

  if (doctors.length === 0) {
    return [];
  }

  return doctors;
};

export const createDoctorService = async (input: CreateDoctorInput) => {
  const createDoctor = await prisma.doctor.create({
    data: {
      name: input.name,
      spesialis: input.spesialis,
      fee: input.fee,
      phone: input.phone ?? null,
      isActive: input.isActive,
    },
  });

  return createDoctor;
};

export const getDoctorByIdService = async (id: number) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id: id,
    },
  });

  if (!doctor) {
    throw new ApiError(404, 'doctor nya ga ada');
  }

  return doctor;
};

export const updateDoctorService = async (id: number, input: UpdateDoctorInput) => {
  await getDoctorByIdService(id);

  const updateDoctorById = await prisma.doctor.update({
    where: { id },
    data: input,
  });

  return updateDoctorById;
};

export const deleteDoctorService = async (id: number) => {
  await getDoctorByIdService(id);

  // disini kurang baik melakukan delete, karna ada histori pasien melakukan pengecekan dengan doktor siapa
  // const deleteDoctorById = await prisma.doctor.delete({ where: { id: id } });
  // return deleteDoctorById;

  // jadi kita lakukan aja melakukan update kalau si doktor ini udah ga aktif lagi
  const updatedDoctor = await prisma.doctor.update({
    where: { id },
    data: { isActive: false },
  });

  return updatedDoctor;
};
