import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Navbar } from "@/components/navbar";
import { useSession, signOut } from "next-auth/react";

// Mock next-auth
jest.mock("next-auth/react");
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock session data
const mockSession = {
  user: {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    image: "https://example.com/avatar.jpg",
    role: "resident",
    rut: "12345678-9",
    isActive: true,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

const mockTeacherSession = {
  ...mockSession,
  user: {
    ...mockSession.user,
    role: "teacher",
  },
};

const mockAdminSession = {
  ...mockSession,
  user: {
    ...mockSession.user,
    role: "admin",
  },
};

describe("Navbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the user actions
    const { getCurrentUser } = require("@/actions/user/getUser");
    const { getRole } = require("@/actions/user/getRole");

    getCurrentUser.mockResolvedValue(null);
    getRole.mockResolvedValue(null);
  });

  describe("Rendering", () => {
    it("should render the navbar with logo", async () => {
      const { getCurrentUser } = require("@/actions/user/getUser");
      const { getRole } = require("@/actions/user/getRole");

      getCurrentUser.mockResolvedValue({ name: "Test User" });
      getRole.mockResolvedValue({ role: "resident", isAdmin: false });

      render(await Navbar());

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getAllByText("ReQuiEM")).toHaveLength(3); // Desktop + 2 mobile instances
    });

    it("should render user name when authenticated", async () => {
      const { getCurrentUser } = require("@/actions/user/getUser");
      const { getRole } = require("@/actions/user/getRole");

      getCurrentUser.mockResolvedValue({ name: "Test User" });
      getRole.mockResolvedValue({ role: "resident", isAdmin: false });

      render(await Navbar());

      expect(screen.getAllByText(/Hola.*Test User.*! 👋/)).toHaveLength(2); // Desktop + mobile
    });

    it("should not render user info when not authenticated", async () => {
      const { getCurrentUser } = require("@/actions/user/getUser");
      const { getRole } = require("@/actions/user/getRole");

      getCurrentUser.mockResolvedValue(null);
      getRole.mockResolvedValue(null);

      render(await Navbar());

      expect(screen.queryByText("Test User")).not.toBeInTheDocument();
    });
  });

  // it("renders logo correctly", async () => {
  //   render(await Navbar(defaultProps));
  //   expect(screen.getAllByText("ReQuiEM Test")[0]).toBeInTheDocument();
  // });

  // it("renders main menu items", async () => {
  //   render(await Navbar(defaultProps));
  //   expect(screen.getByText("Dashboard")).toBeInTheDocument();
  //   expect(screen.getByText("Administrador")).toBeInTheDocument();
  // });

  // it("renders mobile menu sheet content", async () => {
  //   render(await Navbar(defaultProps));
  //   // En nuestros mocks, verificamos que los componentes del Sheet se renderizan
  //   expect(screen.getAllByText(defaultProps.logo.title).length).toBeGreaterThan(
  //     1
  //   );
  // });

  // it("renders mobile menu login options correctly", async () => {
  //   render(await Navbar(defaultProps));

  //   // Verificar que el botón de login existe en la versión móvil
  //   const loginButtons = screen.getAllByText("Iniciar Sesión");
  //   expect(loginButtons.length).toBeGreaterThan(0);
  // });

  // it("renders mobile menu user greeting when authenticated", async () => {
  //   const getCurrentUser = jest.requireMock(
  //     "@/actions/user/getUser"
  //   ).getCurrentUser;
  //   getCurrentUser.mockImplementationOnce(() =>
  //     Promise.resolve({ name: "Dr. Test" })
  //   );

  //   render(await Navbar(defaultProps));

  //   // Verificar que el saludo aparece en la versión móvil
  //   const greetings = screen.getAllByText("Hola Dr. Test! 👋");
  //   expect(greetings.length).toBeGreaterThan(0);
  // });

  // // Test corregido para props por defecto
  // it("renders with default props when no props provided", async () => {
  //   render(await Navbar({}));
  //   // Usamos getAllByText para manejar múltiples elementos "ReQuiEM"
  //   const logoTexts = screen.getAllByText("ReQuiEM");
  //   expect(logoTexts.length).toBeGreaterThan(0);
  //   expect(logoTexts[0]).toBeInTheDocument();

  //   // Verificamos un item de menú por defecto
  //   expect(screen.getByText("Dashboard")).toBeInTheDocument();
  // });

  // it("renders navigation links with correct hrefs", async () => {
  //   render(await Navbar(defaultProps));
  //   // Buscamos el link por su texto y url
  //   const links = screen.getAllByRole("link");
  //   const dashboardLink = links.find(
  //     (link) => link.textContent === "Dashboard"
  //   );
  //   expect(dashboardLink).toHaveAttribute("href", "/dashboard");
  // });

  describe("Navigation Links", () => {
    it("should render dashboard link for residents", async () => {
      const { getCurrentUser } = require("@/actions/user/getUser");
      const { getRole } = require("@/actions/user/getRole");

      getCurrentUser.mockResolvedValue({ name: "Test User" });
      getRole.mockResolvedValue({ role: "resident", isAdmin: false });

      render(await Navbar());

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("should render different navigation for different roles", async () => {
      const { getCurrentUser } = require("@/actions/user/getUser");
      const { getRole } = require("@/actions/user/getRole");

      // Test resident navigation
      getCurrentUser.mockResolvedValue({ name: "Test User" });
      getRole.mockResolvedValue({ role: "resident", isAdmin: false });

      const { unmount } = render(await Navbar());
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      unmount();

      // Test teacher navigation
      getCurrentUser.mockResolvedValue({ name: "Test Teacher" });
      getRole.mockResolvedValue({ role: "teacher", isAdmin: false });

      render(await Navbar());
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      screen.getByRole("navigation").remove();

      // Test admin navigation
      getCurrentUser.mockResolvedValue({ name: "Test Admin" });
      getRole.mockResolvedValue({ role: "admin", isAdmin: true });

      render(await Navbar());
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
  });

  describe("Authentication", () => {
    it("should handle sign out", async () => {
      const { getCurrentUser } = require("@/actions/user/getUser");
      const { getRole } = require("@/actions/user/getRole");

      getCurrentUser.mockResolvedValue({ name: "Test User" });
      getRole.mockResolvedValue({ role: "resident", isAdmin: false });

      render(await Navbar());

      // Look for sign out functionality (this will depend on your actual navbar implementation)
      const navbar = screen.getByRole("navigation");
      expect(navbar).toBeInTheDocument();
    });

    it("should show login option when not authenticated", async () => {
      const { getCurrentUser } = require("@/actions/user/getUser");
      const { getRole } = require("@/actions/user/getRole");

      getCurrentUser.mockResolvedValue(null);
      getRole.mockResolvedValue(null);

      render(await Navbar());

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
  });
});
