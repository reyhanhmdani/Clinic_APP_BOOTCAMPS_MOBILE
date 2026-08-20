import prisma from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { createMedicineInput, updateMedicineInput } from "../validation/medicineSchema.js";
import { Prisma } from "@prisma/client";

export const getAllMedicineService = async () => {
  const medicines = await prisma.medicine.findMany();

  if (medicines.length === 0) {
    throw new ApiError(404, "Medicine nya Kosong");
  }

  return medicines;
};

export const createMedicineService = async (input: createMedicineInput) => {
  const count = await prisma.medicine.count();
  const code = `MED-${String(count + 1).padStart(3, "0")}`;

  const medicine = await prisma.medicine.create({
    data: {
      name: input.name,
      code: code,
      price: input.price,
      stock: input.stock,
      unit: input.unit,
    },
  });

  return medicine;
};

export const getMedicineByIdService = async (id: number) => {
  const getMedicine = await prisma.medicine.findUnique({
    where: {
      id: id,
    },
  });

  if (!getMedicine) {
    throw new ApiError(404, "Medicine yang di cari ga ada");
  }

  return getMedicine;
};

export const updateMedicineService = async (id: number, input: updateMedicineInput) => {
  await getMedicineByIdService(id);

  const updateMedicine = await prisma.medicine.update({
    where: { id },
    data: input,
  });

  return updateMedicine;
};

export const deleteMedicineService = async (id: number) => {
  await getMedicineByIdService(id);

  try {
    const deleteMedicine = await prisma.medicine.delete({
      where: {
        id: id,
      },
    });
    return deleteMedicine;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new ApiError(400, "Medicine tidak dapat dihapus karna memiliki riwayat rekam medis");
    }
    throw error;
  }
};
