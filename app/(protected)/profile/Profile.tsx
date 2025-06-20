import { IUser } from "@/models/User"
import { StrAvatar } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { es } from "date-fns/locale"


export default async function Profile({user, role} : {user: IUser; role :{ isAdmin: boolean; strRole: "Residente" | "Profesor" | null; area: string; }}) {
  
  return (
    <div className="sm:space-x-6 flex flex-col sm:flex-row w-full mx-auto items-center sm:items-start">
      <StrAvatar color={user.image || 'gray'} name={user.name || 'Sin Nombre'} className="size-20 text-4xl mb-6"/>
      <div className="space-y-8 flex-col">
        <Label className="text-2xl justify-center sm:justify-start">{user.name}</Label>

        <div className="flex flex-row text-lg">
          <div className="space-y-1 mr-2 sm:mr-6">
            <Label className="font-semibold text-base justify-start">Rut:</Label>
            <Label className="font-semibold text-base justify-start">Email:</Label>
            <Label className="font-semibold text-base justify-start">Teléfono móvil:</Label>
            <Label className="font-semibold text-base justify-start">Fecha de nacimiento:</Label>
          </div>

          <div className="space-y-1">
            <div className="text-base">{user.rut || <p className="text-muted-foreground">No disponible</p>}</div>
            <div className="text-base">{user.email || <p className="text-muted-foreground">No disponible</p>}</div>
            <div className="text-base">{user.phone || <p className="text-muted-foreground">No disponible</p>}</div>
            <div className="text-base">
              {user.birthdate
                ? format(user.birthdate, "d '/' MMM '/' yyyy", { locale: es })
                : <span className="text-muted-foreground">No disponible</span>}
            </div>
          </div>
        </div>
        <div className="flex">
          <p className="font-semibold mr-1">{role.strRole}</p> del área <p className="font-semibold ml-1">{role.area}</p>
        </div>
      </div>
    </div>
  )
}