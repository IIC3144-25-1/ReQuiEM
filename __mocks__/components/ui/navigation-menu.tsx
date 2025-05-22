import React from 'react';

export const NavigationMenu = ({ children, ...props }: { children: any; props: any }) => (
  <div data-testid="nav-menu" {...props}>{children}</div>
);

export const NavigationMenuContent = ({ children, ...props }: { children: any; props: any }) => (
  <div data-testid="nav-menu-content" {...props}>{children}</div>
);

export const NavigationMenuItem = ({ children, ...props }: { children: any; props: any }) => (
  <div data-testid="nav-menu-item" {...props}>{children}</div>
);

export const NavigationMenuLink = ({ children, asChild, href, ...props }: { children: any; asChild: any; href: any; props: any }) => {
  const Tag = asChild ? 'div' : 'a';
  return <Tag data-testid="nav-menu-link" href={href} {...props}>{children}</Tag>;
};

export const NavigationMenuList = ({ children, ...props }: { children: any; props: any }) => (
  <div data-testid="nav-menu-list" {...props}>{children}</div>
);

export const NavigationMenuTrigger = ({
  children,
  ...props
}: {
  children: any;
  props: any;
}) => (
  <div data-testid="nav-menu-trigger" {...props}>{children}</div>
);