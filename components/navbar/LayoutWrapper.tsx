"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "./Navbar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideNavbar = pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="mx-auto">{children}</div>
      <Toaster />
    </>
  );
}
