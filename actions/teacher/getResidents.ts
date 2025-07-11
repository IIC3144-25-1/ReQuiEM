'use server'

import { IResident } from "@/models/Resident";
import dbConnect from "@/lib/dbConnect";
import { Area } from "@/models/Area";
import { Resident } from "@/models/Resident";

export async function getTeacherResidents(teacherId: string): Promise<IResident[]> {
    await dbConnect();

    const area = await Area.findOne({ teachers: teacherId, deleted: false })
        .populate({
            path: 'residents',
            model: Resident,
            populate: { path: 'user' }
        })
        .exec();
    
    if (!area || !area.residents) {
        return [];
    };
    return JSON.parse(JSON.stringify(area.residents)) as IResident[];
}