'use server'

import dbConnect from "@/lib/dbConnect"
import { Area, IArea } from "@/models/Area"

export async function getArea(id: string) {
    await dbConnect();

    const area = await Area.findById(id)
        .populate("residents")
        .populate("teachers")
        .lean<IArea>()
        .exec();

    return area;
}
