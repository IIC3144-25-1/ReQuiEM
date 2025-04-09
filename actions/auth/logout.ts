'use server'

import { signOut } from "@/auth"; // Ensure correct import
import { redirect } from "next/navigation";

export async function logout() {
  await signOut({ redirect: false }); // Prevent automatic redirection
  redirect("/"); // Manually redirect to the login page
}