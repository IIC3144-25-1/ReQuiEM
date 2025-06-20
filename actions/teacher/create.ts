"use server";

import dbConnect from "@/lib/dbConnect";
import { ITeacher, Teacher } from "@/models/Teacher";
import { User } from "@/models/User";
import { createUser } from "../user/create";
import { addTeacherToArea } from "../area/addTeacher";
import { Area } from "@/models/Area";
import { emailService } from "@/lib/email/email.service";
import { auth } from "@/auth";

// Acción para crear un profesor y asociarlo a un área
export async function createTeacher(formData: FormData): Promise<ITeacher> {
  await dbConnect();

  const email = formData.get("email")?.toString() || "";
  const name = formData.get("name")?.toString() || "";
  const areaId = formData.get("area")?.toString();
  const admin = formData.get("admin") === "true";

  if (!email || !areaId) {
    throw new Error("Email y área son obligatorios");
  }

  // Get current user (admin) for the email
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // 1. Buscar si el usuario ya existe
  let user = await User.findOne({ email });

  if (!user) {
    // 2. Crear nuevo usuario si no existe
    user = await User.create({
      email,
      name: name || email.split("@")[0],
      admin,
    });
    if (!user || !user._id) {
      throw new Error("No se pudo crear el usuario");
    }
  }

  // 3. Verificar si ya existe un Teacher para ese usuario
  const existingTeacher = await Teacher.findOne({ user: user._id });
  if (existingTeacher) {
    throw new Error("Este usuario ya está registrado como profesor");
  }

  // Get area if provided
  let area = null;
  if (areaId && typeof areaId === "string") {
    area = await Area.findById(areaId);
    if (!area) {
      throw new Error("Area not found");
    }
  }

  // 4. Crear el nuevo Teacher con el área asociada
  const teacher = await Teacher.create({
    user: user._id,
    area: areaId,
  });

  await addTeacherToArea(areaId, teacher._id);

  // Send email notification
  try {
    await emailService.sendNewRoleAssignedEmail(email, {
      user: {
        id: user._id.toString(),
        name: user.name || email.split("@")[0],
        email: user.email,
        image: user.image,
      },
      role: "teacher",
      assignedBy: {
        name: session.user.name || "Administrador",
        email: session.user.email || "admin@requiem.cl",
      },
    });
  } catch (error) {
    console.error("Error sending teacher assignment email:", error);
    // Don't throw the error, as the teacher was created successfully
  }

  return JSON.parse(JSON.stringify(teacher));
}
