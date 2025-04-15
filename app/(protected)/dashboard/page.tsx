import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link";
import { getCurrentUser } from "@/actions/user/getUser"
import { logout } from "@/actions/auth/logout";
import { SurgeryForm } from "./surgeryForm";

export default async function DashboardPage() {
    const user = await getCurrentUser();
    return (
        <div className={cn("flex flex-col gap-6 flex min-h-svh w-full items-center justify-center p-6 md:p-10")}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Bienvenido {user?.name} 👋</CardTitle>
                    <CardDescription>
                        Ya estas logeado y estas en una ruta protegida
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <Button variant="outline" className="w-full">
                            <Link href={"/"}>Home</Link>
                        </Button>
                        <form action={logout}>
                            <Button variant="outline" className="w-full" type="submit">
                                Logout
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
            <SurgeryForm />
        </div>
  );
}
