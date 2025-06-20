import { getUser } from "@/actions/user/getUser";
import { getRoleAndArea } from "@/actions/user/getRole";
import Profile from "../../profile/Profile";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ProfilePage(props: {params: Promise<{id: string}>}) {
  const params = await props.params;
  const user = await getUser(params.id)
  if (!user) {
    redirect("/area");
  }
  const role = await getRoleAndArea(params.id)
  if (!user || !role || !role.area) return <div>No autorizado</div>;
  
  return (
    <div className="space-y-6 flex flex-col sm:w-1/2 mx-auto mt-10">
      <Profile user={user} role={role}/> 
      <div className="flex mt-10 space-x-2 justify-center">
        <Link href="/area" className="w-1/2 sm:w-1/3">
          <Button className="w-full sm:min-w-30" variant="outline">
            <ChevronLeft />
            Volver
          </Button>
        </Link>
      </div>
    </div>
  )
}