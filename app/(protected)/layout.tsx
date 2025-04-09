// app/dashboard/layout.tsx
import { auth } from "@/auth";
import { headers } from 'next/headers';
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    const headersList = await headers();
    const header_url = headersList.get('x-pathname') || "";
    const callbackUrl = encodeURIComponent("/" + header_url); // Get the full path
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return <div>{children}</div>;
}
