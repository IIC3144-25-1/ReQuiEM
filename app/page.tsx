import { logout } from "@/actions/auth/logout";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <p>Hola esta es la ruta raiz</p>
        <form action={logout}>
          <Button type="submit" className="w-full">
            Cerrar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
