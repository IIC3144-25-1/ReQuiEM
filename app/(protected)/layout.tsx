import { auth } from "@/auth";
import { headers } from 'next/headers';
import { redirect } from "next/navigation";
import { getRole } from "@/actions/user/getRole";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    const headersList = await headers();
    const header_url = headersList.get('x-pathname') || "";
    const callbackUrl = encodeURIComponent("/" + header_url); // Get the full path
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  const roleInfo = await getRole();

  if (!roleInfo?.isAdmin && !roleInfo?.role) {
    redirect("/unauthorized"); 
  }

  return <div>{children}</div>;
}
