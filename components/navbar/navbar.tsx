import { Book, Trees, Ambulance, Stethoscope } from "lucide-react";
import { getCurrentUser } from "@/actions/user/getUser";
import { getRole, RoleInfo } from "@/actions/user/getRole";
import { NavbarClient } from "./NavbarClient";

const defaultLogo = { alt: "logo", title: "ReQuiEM" };
const defaultAuth = { login: { title: "Iniciar Sesión", url: "/login" } };

export const Navbar = async () => {
  const user = await getCurrentUser();
  const roleInfo: RoleInfo | null = await getRole();
  const isAdmin = roleInfo?.isAdmin === true;
  const role = roleInfo?.role;

  const menuToRender = [];

  if (isAdmin || role === "teacher" || role === "resident") {
    menuToRender.push({
      title: "Dashboard",
      url: role === "resident" ? "/resident/dashboard" : "/teacher/dashboard",
      testId: "nav-dashboard",
    });
  }

  if (isAdmin) {
    menuToRender.push({
      title: "Administrador",
      url: "#",
      testId: "admin-menu",
      items: [
        {
          title: "Residentes",
          description: "Administra los residentes",
          icon: <Book className="size-5 shrink-0" />,
          url: "/admin/resident",
          testId: "admin-residents-link",
        },
        {
          title: "Profesores",
          description: "Administra los profesores",
          icon: <Trees className="size-5 shrink-0" />,
          url: "/admin/teacher",
          testId: "admin-teachers-link",
        },
        {
          title: "Cirugías",
          description: "Maneja las cirugías",
          icon: <Ambulance className="size-5 shrink-0" />,
          url: "/admin/surgeries",
          testId: "admin-surgeries-link",
        },
        {
          title: "Áreas",
          description: "Administra las áreas quirúrgicas",
          icon: <Stethoscope className="size-5 shrink-0" />,
          url: "/admin/areas",
          testId: "admin-areas-link",
        },
      ],
    });
  }

  if (role === "teacher") {
    menuToRender.push({
      title: "Registros",
      url: "/teacher/records",
      testId: "nav-records",
    });
  } else if (role === "resident") {
    menuToRender.push({
      title: "Registros",
      url: "/resident/records",
      testId: "nav-records",
    });
    menuToRender.push({
      title: "Nuevo Registro",
      url: "/resident/new-record",
      testId: "nav-new-record",
    });
  }

  return (
    <NavbarClient
      logo={defaultLogo}
      auth={defaultAuth}
      user={user && user.name ? { name: user.name } : null}
      menuToRender={menuToRender}
    />
  );
};
