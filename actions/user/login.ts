"use server";

import { signIn } from "@/auth"; // Ensure correct import

interface LoginWithGoogleProps {
    redirectTo: string | null
}

export async function loginWithGoogle({ redirectTo }: LoginWithGoogleProps) {
  return await signIn("google", { redirectTo: redirectTo ? redirectTo : "/" });
}
