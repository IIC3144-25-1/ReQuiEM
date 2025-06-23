'use server'

import { User } from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function updateUser(formData: FormData) {
  await dbConnect();
  const userId = formData.get("id");
  const name = formData.get("name");  
  const rut = formData.get("rut");
  const phone = formData.get("phone");
  const birthdate = formData.get("birthdate");
  const image = formData.get("image");  

  if (!userId || typeof userId !== "string") {
    throw new Error("User ID is required");
  }

  const user = await User.findById(userId)
  if (name) user.name = name.toString()
  if (rut) user.rut = rut.toString()
  if (phone) user.phone = phone.toString() 
  if (birthdate) user.birthdate = new Date(birthdate as string);
  if (image) user.image = image.toString()

  await user.save();
  return;
}
