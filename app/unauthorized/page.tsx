// app/403/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ZapOff } from 'lucide-react'

export default function Unauthorized() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 py-4">
      <Card className="w-full max-w-xs sm:max-w-md">
        <CardHeader className="flex flex-col items-center pt-6 sm:pt-8">
          <ZapOff className="h-12 w-12 sm:h-16 sm:w-16 text-red-500" />
          <CardTitle className="mt-4 text-lg sm:text-2xl">
            Acceso no autorizado
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center px-4 sm:px-6 space-y-2">
          <p className="text-sm sm:text-base">
            No tienes permiso para acceder a esta página.
          </p>
          <p className="text-sm sm:text-base">
            Si crees que esto es un error, por favor contacta con el
            administrador del sistema.
          </p>
        </CardContent>

        <CardFooter className="flex justify-center px-4 sm:px-6 pb-6 sm:pb-8">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.back()}
          >
            Volver
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
