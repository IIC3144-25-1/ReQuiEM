"use client";

import { LogIn } from "lucide-react";
import { logout } from "@/actions/auth/logout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
        Bienvenido a <span className="text-blue-600">ReQuiEM</span>
      </h1>

      <p className="text-gray-700 text-lg md:text-xl max-w-xl mb-8">
        Una plataforma para registrar procedimientos quirúrgicos y facilitar la retroalimentación entre doctores e internos de medicina.
      </p>

      <div className="flex flex-row items-center justify-center gap-4 mt-6">
        {/* Botón de cierre de sesión solo para debugging temporal */}
        <form action={logout} className="">
          <Button type="submit" variant="outline">
            Cerrar Sesión (Temporal)
          </Button>
        </form>

        <Link href="/login">
          <Button className="flex items-center gap-2 px-6 py-3">
            <LogIn className="w-6 h-5" />
            Iniciar Sesión
          </Button>
        </Link>
      </div>
    </main>
  );
}
