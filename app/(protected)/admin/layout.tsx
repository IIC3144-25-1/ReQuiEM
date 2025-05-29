import { redirect } from "next/navigation";
import { getRole } from "@/actions/user/getRole";

export default async function Layout({ children }: { children: React.ReactNode }) {

  const roleInfo = await getRole();

  if (!roleInfo?.isAdmin) {
    redirect("/unauthorized"); 
  }

  return <div>{children}</div>;
}
