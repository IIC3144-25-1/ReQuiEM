import "@testing-library/jest-dom";
import "@testing-library/jest-dom";
import React from "react";

// Definir React globalmente para las pruebas
global.React = React;
// Mock básico sin usar React directamente
jest.mock("@/components/ui/accordion", () => ({
  Accordion: jest.fn(({ children }) => children),
  AccordionContent: jest.fn(({ children }) => children),
  AccordionItem: jest.fn(({ children }) => children),
  AccordionTrigger: jest.fn(({ children }) => children),
}));

jest.mock("@/components/ui/navigation-menu", () => ({
  NavigationMenu: jest.fn(({ children }) => children),
  NavigationMenuContent: jest.fn(({ children }) => children),
  NavigationMenuItem: jest.fn(({ children }) => children),
  NavigationMenuLink: jest.fn(({ children }) => children),
  NavigationMenuList: jest.fn(({ children }) => children),
  NavigationMenuTrigger: jest.fn(({ children }) => children),
}));

jest.mock("@/components/ui/sheet", () => ({
  Sheet: jest.fn(({ children }) => children),
  SheetContent: jest.fn(({ children }) => children),
  SheetHeader: jest.fn(({ children }) => children),
  SheetTitle: jest.fn(({ children }) => children),
  SheetTrigger: jest.fn(({ children }) => children),
}));

jest.mock("@/components/ui/button", () => ({
  Button: jest.fn(({ children, asChild }) => children),
}));

jest.mock("lucide-react", () => ({
  Book: jest.fn(() => null),
  Menu: jest.fn(() => null),
  Sunset: jest.fn(() => null),
  Trees: jest.fn(() => null),
  Zap: jest.fn(() => null),
  Ambulance: jest.fn(() => null),
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
