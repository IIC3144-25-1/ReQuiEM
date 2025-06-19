import "@testing-library/jest-dom";
import "whatwg-fetch";

// Polyfill for TextEncoder/TextDecoder (needed for MongoDB)
import { TextEncoder, TextDecoder } from "util";
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({}),
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require("react");
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement("img", { ...props, alt: props.alt });
  },
}));

// Suppress Mongoose Jest warnings
process.env.SUPPRESS_JEST_WARNINGS = "true";

// Mock environment variables for testing
// Use test database on MongoDB Atlas
process.env.MONGODB_URI_TEST =
  process.env.MONGODB_URI_TEST ||
  process.env.MONGODB_URI?.replace(/\/[^/]*$/, "/requiem_test") ||
  "mongodb://localhost:27017/requiem_test";
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST; // Ensure MONGODB_URI is set for tests
process.env.NEXTAUTH_SECRET = "test-secret-for-jest";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";
process.env.MICROSOFT_CLIENT_ID = "test-microsoft-client-id";
process.env.MICROSOFT_CLIENT_SECRET = "test-microsoft-client-secret";

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: jest.fn(),
});

// Mock next-auth
jest.mock("next-auth", () => ({
  default: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// MongoDB adapter mock removed - not needed for component tests

// Mock user actions
jest.mock("@/actions/user/getUser", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/actions/user/getRole", () => ({
  getRole: jest.fn(),
}));

// Setup cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});
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
  SheetClose: jest.fn(({ children }) => children),
}));

jest.mock("@/components/ui/button", () => ({
  Button: jest.fn(({ children }) => children),
}));

jest.mock("lucide-react", () => ({
  Book: jest.fn(() => null),
  Menu: jest.fn(() => null),
  Sunset: jest.fn(() => null),
  Trees: jest.fn(() => null),
  Zap: jest.fn(() => null),
  Ambulance: jest.fn(() => null),
  Stethoscope: jest.fn(() => null),
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
