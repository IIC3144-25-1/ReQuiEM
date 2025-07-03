import { Book, Trees, Ambulance, Stethoscope } from "lucide-react"
import { getCurrentUser } from "@/actions/user/getUser"
import { getRole, RoleInfo } from "@/actions/user/getRole"
import { NavbarClient } from "./NavbarClient"

const defaultLogo = { alt: "logo", title: "SurgiSkills" }
const defaultAuth = { login: { title: "Iniciar Sesión", url: "/login" } }

export const Navbar = async () => {
  const user = await getCurrentUser()
  const roleInfo: RoleInfo | null = await getRole()
  const isAdmin = roleInfo?.isAdmin === true
  const role = roleInfo?.role

  const menuToRender = []

  if (isAdmin || role === "teacher" || role === "resident") {
    menuToRender.push({
      title: "Dashboard",
      url: role === "resident" ? "/resident/dashboard" : "/teacher/dashboard",
    })
  }

  if (isAdmin) {
    menuToRender.push({
      title: "Administrador",
      url: "#",
      items: [
        { title: "Residentes", description: "Administra los residentes", icon: <Book className="size-5 shrink-0" />, url: "/admin/resident" },
        { title: "Profesores", description: "Administra los profesores", icon: <Trees className="size-5 shrink-0" />, url: "/admin/teacher" },
        { title: "Cirugías", description: "Maneja las cirugías", icon: <Ambulance className="size-5 shrink-0" />, url: "/admin/surgeries" },
        { title: "Áreas", description: "Administra las áreas quirúrgicas", icon: <Stethoscope className="size-5 shrink-0" />, url: "/admin/areas" },
      ],
    })
  }

  if (role === "teacher") {
    menuToRender.push({ title: "Registros", url: "/teacher/records" })
  } else if (role === "resident") {
    menuToRender.push({ title: "Registros", url: "/resident/records" })
  }

  if (isAdmin || role === "teacher" || role === "resident") {
    menuToRender.push({
      title: "Área",
      url: "/area",
    })
  }

  return (
    <NavbarClient
      logo={defaultLogo}
      auth={defaultAuth}
      user={user && user.name && user.image ? { name: user.name, image: user.image }
            : user && user.name ? { name: user.name, image: 'gray'}
            : user && user.image ? { name: user.email, image: user.image}
            : user ? {name: user.email, image: 'gray'}
            : null
          }
      menuToRender={menuToRender}
    />
  )
}
