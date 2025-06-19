"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "@/models/User";
import { connectDB } from "@/lib/dbConnect";

interface CreateUserData {
  name: string;
  email: string;
  role: 'resident' | 'teacher' | 'admin';
  rut: string;
  image?: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'resident' | 'teacher' | 'admin';
  rut?: string;
  image?: string;
  isActive?: boolean;
}

interface GetUsersFilters {
  role?: 'resident' | 'teacher' | 'admin';
  isActive?: boolean;
}

export async function createUser(userData: CreateUserData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'No autorizado' };
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: userData.email }, { rut: userData.rut }] 
    });

    if (existingUser) {
      return { success: false, error: 'Usuario con este email o RUT ya existe' };
    }

    const user = await User.create({
      ...userData,
      isActive: true,
    });

    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUser(userId: string, updateData: UpdateUserData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { success: false, error: 'No autorizado' };
    }

    // Users can update their own profile, admins can update any profile
    if (session.user.role !== 'admin' && session.user.id !== userId) {
      return { success: false, error: 'No autorizado' };
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'No autorizado' };
    }

    await connectDB();

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUsers(filters: GetUsersFilters = {}) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'teacher')) {
      return { success: false, error: 'No autorizado' };
    }

    await connectDB();

    const query: any = {};
    
    if (filters.role) {
      query.role = filters.role;
    }
    
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    return { success: true, data: users };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserById(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { success: false, error: 'No autorizado' };
    }

    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Users can only see their own profile unless they're admin
    if (session.user.role !== 'admin' && session.user.id !== userId) {
      return { success: false, error: 'No autorizado' };
    }

    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
