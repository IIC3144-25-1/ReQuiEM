import { redirect } from "next/navigation";
import { getRole } from "@/actions/user/getRole";

export default async function Layout({ children }: { children: React.ReactNode }) {

  const roleInfo = await getRole();

  if (roleInfo?.role !== "teacher") {
    redirect("/unauthorized"); 
  }

  return <div>{children}</div>;
}
