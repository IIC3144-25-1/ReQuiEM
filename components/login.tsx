'use client'

import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { loginWithGoogle } from "@/actions/user/login";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || null;
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
            <CardHeader>
            <CardTitle className="text-2xl">Bienvenido 👋</CardTitle>
            <CardDescription>
                Inicia sesión para acceder a tu cuenta
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form>
                <div className="flex flex-col gap-6">
                <Button variant="outline" className="w-full" onClick={() => loginWithGoogle({ redirectTo: callbackUrl })}>
                    Login with Google
                </Button>
                </div>
            </form>
            </CardContent>
        </Card>
        </div>
  )
}
