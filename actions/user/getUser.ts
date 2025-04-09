'use server'

import { User, IUser } from "@/models/User"
import dbConnect from "@/lib/dbConnect"
import { auth } from "@/auth"

export async function getCurrentUser() {
    await dbConnect();
    const session = await auth()

    if (!session?.user) return null

    // Fetch the user from the database
  const user = await User.findOne({ email: session.user.email }).lean<IUser>().exec();
  return user; // Return user object or null if not found
}

