import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "../../components/navbar/navbar";

// Solo necesitamos mantener estos mocks esenciales
jest.mock("@/actions/user/getUser", () => ({
  getCurrentUser: jest.fn(() => Promise.resolve(null)),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

describe("Navbar1", () => {
  const defaultProps = {
    logo: {
      alt: "Test Logo",
      title: "ReQuiEM Test",
    },
    menu: [
      { title: "Dashboard", url: "/dashboard" },
      {
        title: "Administrador",
        url: "#",
        items: [
          {
            title: "Residentes",
            description: "Maneja los residentes",
            url: "/admin/resident",
          },
        ],
      },
    ],
    auth: {
      login: { title: "Iniciar Sesión", url: "/login" },
    },
  };

  it("renders logo correctly", async () => {
    render(await Navbar(defaultProps));
    expect(screen.getAllByText("ReQuiEM Test")[0]).toBeInTheDocument();
  });

  it("renders main menu items", async () => {
    render(await Navbar(defaultProps));
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });



  it("renders mobile menu sheet content", async () => {
    render(await Navbar(defaultProps));
    // En nuestros mocks, verificamos que los componentes del Sheet se renderizan
    expect(screen.getAllByText(defaultProps.logo.title).length).toBeGreaterThan(
      1
    );
  });


  it("renders mobile menu login options correctly", async () => {
    render(await Navbar(defaultProps));

    // Verificar que el botón de login existe en la versión móvil
    const loginButtons = screen.getAllByText("Iniciar Sesión");
    expect(loginButtons.length).toBeGreaterThan(0);
  });

  it("renders mobile menu user greeting when authenticated", async () => {
    const getCurrentUser = jest.requireMock(
      "@/actions/user/getUser"
    ).getCurrentUser;
    getCurrentUser.mockImplementationOnce(() =>
      Promise.resolve({ name: "Dr. Test" })
    );

    render(await Navbar(defaultProps));

    // Verificar que el saludo aparece en la versión móvil
    const greetings = screen.getAllByText("Hola Dr. Test! 👋");
    expect(greetings.length).toBeGreaterThan(0);
  });

  // Test corregido para props por defecto
  it("renders with default props when no props provided", async () => {
    render(await Navbar({}));
    // Usamos getAllByText para manejar múltiples elementos "ReQuiEM"
    const logoTexts = screen.getAllByText("ReQuiEM");
    expect(logoTexts.length).toBeGreaterThan(0);
    expect(logoTexts[0]).toBeInTheDocument();

    // Verificamos un item de menú por defecto
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders navigation links with correct hrefs", async () => {
    render(await Navbar(defaultProps));
    // Buscamos el link por su texto y url
    const links = screen.getAllByRole("link");
    const dashboardLink = links.find(
      (link) => link.textContent === "Dashboard"
    );
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
  });
});
