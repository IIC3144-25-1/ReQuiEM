"use server";

import dbConnect from "@/lib/dbConnect";
import { IResident, Resident } from "@/models/Resident";
import { User } from "@/models/User";
import { createUser } from "../user/create";
import { z } from "zod";
import { addResidentToArea } from "../area/addResident";
import { Area } from "@/models/Area";
import { emailService } from "@/lib/email/email.service";
import { auth } from "@/auth";

// 1) Esquema Zod para validar la forma final
const residentSchema = z.object({
  user: z.string().min(1, "User ID is required"),
  area: z.string().min(1, "Area id"),
});

type ResidentRaw = z.infer<typeof residentSchema>;

// 2) Server Action
export async function createResident(formData: FormData): Promise<IResident> {
  // 2.1) Conexión a BD
  await dbConnect();

  // 2.2) Extraer email del form
  const email = formData.get("email")?.toString();
  if (!email) {
    throw new Error("Email is required to create or link User");
  }

  // 2.3) Buscar User existente por email
  let user = await User.findOne({ email }).exec();

  if (!user) {
    // 2.4) Si no existe, crear nuevo User
    user = await createUser(formData);
    if (!user || !user._id) {
      throw new Error("Failed to create new User");
    }
  }

  // 2.5) Obtener el userId para asignar al Resident
  const userId = user._id.toString();

  // 2.6) Recopilar el area
  const areaId = formData.get("areaId")?.toString();

  if (!areaId) {
    throw new Error("Area is required to create or link User");
  }

  // 2.8) Raw payload para Resident
  const raw: ResidentRaw = {
    user: userId,
    area: areaId,
  };

  // 3) Validación Zod
  const data = residentSchema.parse(raw);

  // 4) Crear documento Mongoose
  const resident = await Resident.create(data);


  // Añadimos nuevo residente al area
  await addResidentToArea(areaId, resident._id.toString());

  // Get current user (admin) for the email
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Send email notification 
  try {
    await emailService.sendNewRoleAssignedEmail(email, {
      user: {
        id: user._id.toString(),
        name: user.name || email.split("@")[0],
        email: user.email,
        image: user.image,
      },
      role: "resident",
      assignedBy: {
        name: session.user.name || "Administrador",
        email: session.user.email || "admin@surgeryskills.cl",
      },
    });
  } catch (error) {
    console.error("Error sending resident assignment email:", error);
    // Don't throw the error, as the resident was created successfully
  }

  // 5) Devolver POJO serializable
  return JSON.parse(JSON.stringify(resident));
}
