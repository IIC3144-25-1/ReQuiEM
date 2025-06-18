import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/user/getUser";
import { getRole } from "@/actions/user/getRole";

export default async function AfterLogin() {
  const user = await getCurrentUser()
  if (!user) redirect("/login");
  if (!user.name) redirect("/profile/edit");
  
  const roleInfo = await getRole();
  if (roleInfo?.role === "teacher") redirect("/teacher/records"); 
  if (roleInfo?.role === "resident") redirect("/resident/records");
  else redirect("/");
}
