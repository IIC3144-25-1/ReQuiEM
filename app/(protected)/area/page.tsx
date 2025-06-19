'use server'

import Area from "./Area"
import { getArea } from "@/actions/area/getByUser"
import { redirect } from "next/navigation"

export default async function AreaPage() {
  const area = await getArea()
  if(!area) redirect('/profile')

  return <Area area={JSON.parse(JSON.stringify(area))}/>
}