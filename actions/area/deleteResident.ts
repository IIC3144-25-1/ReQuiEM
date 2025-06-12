'use server'

import dbConnect from "@/lib/dbConnect";
import { Area } from "@/models/Area";

export async function deleteResidentFromArea(residentId: string): Promise<void> {
    await dbConnect();

    await Area.findOneAndUpdate(
        { residents: residentId }, // Include soft delete check
        { $pull: { residents: residentId } }
    );

}

