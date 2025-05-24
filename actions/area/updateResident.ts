'use server'

import dbConnect from "@/lib/dbConnect"
import { Resident } from "@/models/Resident";
import { Area } from "@/models/Area";


export async function updateResidentArea(areaId: string, residentId: string): Promise<void> {
    await dbConnect();
    
    const resident = await Resident.findById(residentId).exec();
    const newArea = await Area.findById(areaId).exec();
    const oldArea = await Area.findById(resident?.area).exec();
    
    if (oldArea === newArea) return;

    resident.area = areaId;
    await resident.save();
    newArea?.residents.push(residentId);
    await newArea?.save();
    if (oldArea) {
        oldArea?.residents.remove(residentId);
        await oldArea?.save();
    }

    return resident;
}