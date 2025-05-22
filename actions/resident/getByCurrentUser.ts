'use server'

import { Resident, IResident } from "@/models/Resident";
import dbConnect from "@/lib/dbConnect";
import { getCurrentUser } from "../user/getUser";


export async function getUserResident(): Promise<IResident | null> {
    await dbConnect();

    const user = await getCurrentUser();
    // We populate the user and teachers fields to get the full objects
    // instead of just their ObjectIds.
    // This is useful if you want to display more information about the user
    const resident = await Resident.findOne({user: user?._id}).populate('user').populate('teachers').lean<IResident>().exec();

    return resident; // Return user object or null if not found
}