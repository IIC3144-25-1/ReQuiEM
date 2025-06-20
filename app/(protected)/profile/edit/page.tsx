import { getCurrentUser } from "@/actions/user/getUser";
import EditProfile from "./EditProfile";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/");
  }
  
  return <EditProfile user={JSON.parse(JSON.stringify(user))}/>
}