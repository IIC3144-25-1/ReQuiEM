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
import { loginWithGoogle, loginWithMicrosoft } from "@/actions/auth/login";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || null;

    const handleLoginWithGoogle = async () => {
        await loginWithGoogle({ redirectTo: callbackUrl });
    }
    const handleLoginWithMicrosoft = async () => {
        await loginWithMicrosoft({ redirectTo: callbackUrl });
    }
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
            <form action={handleLoginWithGoogle}>
                <div className="flex flex-col gap-6">
                <Button type="submit" variant="outline" className="w-full">
                    Login with Google
                </Button>
                </div>
            </form>
            <form action={handleLoginWithMicrosoft}>
                <div className="flex flex-col gap-6">
                <Button type="submit" variant="outline" className="w-full">
                    Login with Microsoft
                </Button>
                </div>
            </form>
            </CardContent>
        </Card>
      </div>
  )
}
