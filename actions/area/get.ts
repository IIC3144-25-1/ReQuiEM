'use server'

import dbConnect from "@/lib/dbConnect"
import { Area, IArea } from "@/models/Area"
import { Resident } from "@/models/Resident"
import { Teacher } from "@/models/Teacher"

export async function getArea(id: string): Promise<IArea | null> {
    await dbConnect();

    const area = await Area.findById(id)
        .where("deleted").equals(false)
        .populate({path: "residents", model: Resident })
        .populate({path: "teachers", model: Teacher })
        .lean<IArea>()
        .exec();

    return area;
}
