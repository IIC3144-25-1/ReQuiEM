import { getCurrentUser } from "@/actions/user/getUser";
import { getRoleAndArea } from "@/actions/user/getRole";
import Profile from "./Profile";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { logout } from "@/actions/auth/logout"

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/");
  }
  const role = await getRoleAndArea(user._id.toString())
  if (!user || !role || !role.area) return <div>No autorizado</div>;
  
  return (
    <div className="space-y-6 flex flex-col sm:w-1/2 mx-auto mt-10">
      <Profile user={user} role={role}/>
      <div className="flex mt-10 space-x-2 justify-center">
        <form action={logout} className="w-1/2 sm:w-1/3">
          <Button type="submit" variant="outline" className="w-full">
            Cerrar Sesión
          </Button>
        </form>
        <Link href="/profile/edit" className="w-1/2 sm:w-1/3">
          <Button className="w-full">
            Editar Perfil
          </Button>
        </Link>
      </div>
    </div>
  )
}