'use server'

import { Resident, IResident } from "@/models/Resident";
import dbConnect from "@/lib/dbConnect";
import { getCurrentUser } from "../user/getUser";


export async function getUserResident(): Promise<IResident | null> {
    await dbConnect();

    const user = await getCurrentUser();
    const resident = await Resident.findOne({user: user?._id})

    return resident;
}