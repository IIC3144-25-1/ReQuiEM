'use server'

import { Book, Menu, Sunset, Trees, Zap, Ambulance, Stethoscope } from "lucide-react";


import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getCurrentUser } from "@/actions/user/getUser";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  logo?: {
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: {
      title: string;
      url: string;
    };
  };
}

const Navbar1 = async ({
  logo = {
    alt: "logo",
    title: "ReQuiEM",
  },
  menu = [
    { title: "Dashboard", url: "/dashboard" },
    { 
      title: "Registros", 
      url: "#",
      items: [
        {
          title: "Residente",
          url: "/resident/records",
        },
        {
          title: "Profesor",
          url: "/teacher/records",
        },
      ]
    }, // Se podría verificar si el usuario es profesor o residente y llevarlo a su propio records

    {
      title: "Administrador",
      url: "#",
      items: [
        {
          title: "Residentes",
          description: "Administra los residentes",
          icon: <Book className="size-5 shrink-0" />,
          url: "/admin/resident",
        },
        {
          title: "Profesores",
          description: "Administra los profesores",
          icon: <Trees className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Cirugias",
          description: "Maneja las cirugias",
          icon: <Ambulance className="size-5 shrink-0" />,
          url: "/admin/surgeries",
        },
        {
          title: "Areas",
          description: "Administra las areas quirurgicas",
          icon: <Stethoscope className="size-5 shrink-0" />,
          url: "/admin/surgeries",
        },
      ],
    },
    {
      title: "Residente",
      url: "#",
      items: [
        {
          title: "Registros",
          description: "Registros de los residentes y profesores",
          icon: <Zap className="size-5 shrink-0" />,
          url: "/teacher/records",
        },
        {
          title: "Contact Us",
          description: "We are here to help you with any questions you have",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Status",
          description: "Check the current status of our services and APIs",
          icon: <Trees className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Terms of Service",
          description: "Our terms and conditions for using our services",
          icon: <Book className="size-5 shrink-0" />,
          url: "#",
        },
      ],
    },
  ],
  auth = {
    login: { title: "Login", url: "/login" },
  },
}: Navbar1Props) => {
    const user = await getCurrentUser();
  return (
    <section className="p-4">
      <div className="container mx-auto">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href={'/'} className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-2 items-center">
          {user ? (
                <div className="text-md font-semibold">
                Hola {user?.name}! 👋
                </div>
                ) : (

            <Button asChild variant="outline">
                <a href={auth.login.url}>{auth.login.title}</a>
            </Button>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href={'/'} className="flex items-center gap-2">
                <span className="text-lg font-semibold tracking-tighter">
                    {logo.title}
                </span>
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <a href={'/'} className="flex items-center gap-2">
                        <span className="text-lg font-semibold tracking-tighter">
                            {logo.title}
                        </span>
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>

                  <div className="flex flex-col gap-3">
                    {user ? (
                      <div className="text-md font-semibold">
                        Hola {user?.name}! 👋
                        </div>
                        ) : (

                    <Button asChild variant="outline">
                      <a href={auth.login.url}>{auth.login.title}</a>
                    </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </a>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="flex flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export { Navbar1 };
