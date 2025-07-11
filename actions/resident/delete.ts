'use server'

import { Resident } from "@/models/Resident";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import { deleteResidentFromArea } from "../area/deleteResident";
import { revalidatePath } from "next/cache";

export async function deleteResident(id: string) {
  await dbConnect();

  // Validar si el ID es válido
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID inválido");
  }

  // Eliminar residente
  const deletedResident = await Resident.findByIdAndUpdate(
    id,
    { deleted: true },
    { new: true }
  ).exec();

  await deleteResidentFromArea(id);

  // Si no se encuentra, lanzar error
  if (!deletedResident) {
    throw new Error("Residente no encontrado");
  }

  revalidatePath("/admin/residents");
}
