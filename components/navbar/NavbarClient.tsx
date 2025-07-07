"use client";

import React from "react";
import Link from "next/link";
import { Menu as MenuIcon } from "lucide-react";
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
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { StrAvatar } from "@/components/ui/avatar"
import { TailwindColor } from "@/utils/colors"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ModeToggle } from "./ToggleTheme"
import PWAInstallPrompt from "../pwa/PWAInstallPrompt"

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
  testId?: string;
}

interface NavbarClientProps {
  logo: { alt: string; title: string }
  auth: { login: { title: string; url: string } }
  user: { name: string, image: TailwindColor } | null
  menuToRender: MenuItem[]
}

export const NavbarClient: React.FC<NavbarClientProps> = ({
  logo,
  auth,
  user,
  menuToRender,
}) => {
  return (
    <section className="p-4">
      <div className="container mx-auto">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                {menuToRender.map((item) => renderMenuItem(item))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex gap-4 items-center">
            {user ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/profile" className="flex items-center space-x-2">
                    <StrAvatar color={user.image} name={user.name} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.name}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button asChild variant="outline">
                <a href={auth.login.url}>{auth.login.title}</a>
              </Button>
            )}
            <ModeToggle />
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  data-testid="mobile-menu-button"
                  variant="link"
                  size="icon"
                >
                  <MenuIcon className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                {/* <SheetContent className="relative flex h-full flex-col overflow-y-auto"> */}
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-4">
                    <SheetClose asChild>
                    <Link href="/" className="flex items-center gap-2">
                      <span className="text-lg font-semibold tracking-tighter">
                        {logo.title}
                      </span>
                    </Link>
                    </SheetClose>
                    <ModeToggle />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menuToRender.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  <div className="flex flex-col gap-3 mt-5">
                    {user ? (
                      <SheetClose asChild>
                      <Link href="/profile" className="flex items-center space-x-2">
                        <StrAvatar color={user.image} name={user.name} />
                        <p className="text-sm font-semibold">{user.name}</p>
                      </Link>
                      </SheetClose>
                    ) : (
                      <SheetClose asChild>
                        <Button variant="outline" asChild className="w-full">
                          <Link href={auth.login.url} className="w-full">
                            {auth.login.title}
                          </Link>
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                </div>
                <div className="pt-4 p-4 mt-auto">
                  <PWAInstallPrompt />
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
        <NavigationMenuTrigger data-testid={item.testId}>
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((sub) => (
            <NavigationMenuLink asChild key={sub.title} className="w-80">
              <SubMenuLink item={sub} />
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
        data-testid={item.testId}
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
          {item.items.map((sub) => (
            <SheetClose key={sub.title} asChild>
              <SubMenuLink key={sub.title} item={sub} />
            </SheetClose>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <SheetClose asChild key={item.title}>
      <Link key={item.title} href={item.url} className="text-md font-semibold">
        {item.title}
      </Link>
    </SheetClose>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => (
  <Link
    className="w-80 flex flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
    href={item.url}
    data-testid={item.testId}
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
  </Link>
);
