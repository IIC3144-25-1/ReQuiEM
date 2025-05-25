describe("Navbar End-to-End Tests", () => {
  beforeEach(() => {
    // Visitar la página principal antes de cada prueba
    cy.visit("/");
  });

  describe("Desktop Navbar - Unauthenticated User", () => {
    it("should display the Navbar with logo", () => {
      cy.get("nav").should("be.visible");
      cy.contains("a", "ReQuiEM")
        .should("be.visible")
        .and("have.attr", "href", "/");
    });

    it("should display main desktop navigation links for unauthenticated user", () => {
      cy.get("nav").within(() => {
        // Dashboard como link directo
        cy.contains("a", "Dashboard")
          .should("be.visible")
          .and("have.attr", "href", "/dashboard");

        // Botones de dropdown
        cy.contains("button", "Registros").should("be.visible");
        cy.contains("button", "Administrador").should("be.visible");
        cy.contains("button", "Residente").should("be.visible");
      });
    });

    it('should display the "Login" button when no user is authenticated', () => {
      cy.get("nav").within(() => {
        cy.contains("a", "Login")
          .should("be.visible")
          .and("have.attr", "href", "/login");
      });
    });

    it("should navigate to login page when clicking Login button", () => {
      cy.get("nav").contains("a", "Login").click();
      cy.url().should("include", "/login");

      // Verificar que estamos en la página de login
      cy.contains("Bienvenido 👋").should("be.visible");
      cy.contains("Login with Google").should("be.visible");
    });

    it('should open the "Administrador" dropdown and show its items', () => {
      cy.get("nav").contains("button", "Administrador").click();

      cy.get('[role="dialog"]').should("be.visible");

      cy.get('[role="dialog"]').within(() => {
        cy.contains("a", "Residentes")
          .should("be.visible")
          .and("have.attr", "href", "/admin/resident");

        cy.contains("a", "Profesores")
          .should("be.visible")
          .and("have.attr", "href", "/admin/teacher");

        cy.contains("a", "Cirugias")
          .should("be.visible")
          .and("have.attr", "href", "/admin/surgeries");

        cy.contains("a", "Areas")
          .should("be.visible")
          .and("have.attr", "href", "/admin/areas");
      });
    });

    it('should open the "Registros" dropdown and show its items', () => {
      cy.get("nav").contains("button", "Registros").click();

      cy.get('[role="dialog"]').should("be.visible");

      cy.get('[role="dialog"]').within(() => {
        cy.contains("a", "Residente")
          .should("be.visible")
          .and("have.attr", "href", "/resident/records");

        cy.contains("a", "Profesor")
          .should("be.visible")
          .and("have.attr", "href", "/teacher/records");
      });
    });

    it("should close dropdown when clicking outside", () => {
      cy.get("nav").contains("button", "Administrador").click();
      cy.get('[role="dialog"]').should("be.visible");

      cy.get("body").click(0, 0);
      cy.get('[role="dialog"]').should("not.exist");
    });

    it("should navigate to dashboard when clicking Dashboard link", () => {
      cy.get("nav").contains("a", "Dashboard").click();
      cy.url().should("include", "/dashboard");
    });

    it("should navigate to admin resident page from dropdown", () => {
      cy.get("nav").contains("button", "Administrador").click();
      cy.get('[role="dialog"]').contains("a", "Residentes").click();
      cy.url().should("include", "/admin/resident");
    });
  });

  describe("Desktop Navbar - Authenticated User", () => {
    beforeEach(() => {
      // Simular usuario autenticado
      cy.mockAuthenticatedUser();
    });

    it("should not display Login button when user is authenticated", () => {
      cy.get("nav").within(() => {
        cy.contains("a", "Login").should("not.exist");
      });
    });

    it("should display user profile or logout option when authenticated", () => {
      cy.get("nav").within(() => {
        // Podría ser un dropdown de usuario, botón de logout, o avatar
        // Ajusta según tu implementación
        cy.get('[data-testid="user-menu"]')
          .should("exist")
          .or(cy.contains("button", "Logout").should("exist"))
          .or(cy.get('[data-testid="user-avatar"]').should("exist"));
      });
    });

    it("should have access to protected routes when authenticated", () => {
      cy.get("nav").contains("a", "Dashboard").click();
      cy.url().should("include", "/dashboard");
      // No debería redirigir a login
      cy.url().should("not.include", "/login");
    });
  });

  describe("Mobile Navbar - Unauthenticated User", () => {
    beforeEach(() => {
      cy.viewport("iphone-6");
    });

    it("should display the mobile menu trigger and logo", () => {
      cy.get("div.lg\\:hidden").should("be.visible");
      cy.get("div.lg\\:hidden")
        .contains("a", "ReQuiEM")
        .should("be.visible")
        .and("have.attr", "href", "/");

      cy.get('button[aria-label="Open menu"]').should("be.visible");
    });

    it("should open the mobile menu sheet and display items including Login", () => {
      cy.get('button[aria-label="Open menu"]').click();

      cy.get('[role="dialog"]').should("be.visible");

      cy.get('[role="dialog"]').within(() => {
        cy.contains("a", "ReQuiEM").should("be.visible");
        cy.contains("a", "Dashboard").should("be.visible");
        cy.contains("button", "Registros").should("be.visible");
        cy.contains("button", "Administrador").should("be.visible");
        cy.contains("button", "Residente").should("be.visible");
        cy.contains("a", "Login").should("be.visible");
      });
    });

    it("should navigate to login from mobile menu", () => {
      cy.get('button[aria-label="Open menu"]').click();
      cy.get('[role="dialog"]').contains("a", "Login").click();
      cy.url().should("include", "/login");
    });

    it("should open an accordion item in the mobile menu", () => {
      cy.get('button[aria-label="Open menu"]').click();
      cy.get('[role="dialog"]').contains("button", "Administrador").click();

      cy.get('[role="dialog"]').within(() => {
        cy.contains("a", "Residentes")
          .should("be.visible")
          .and("have.attr", "href", "/admin/resident");

        cy.contains("a", "Profesores").should("be.visible");
        cy.contains("a", "Cirugias").should("be.visible");
        cy.contains("a", "Areas").should("be.visible");
      });
    });
  });

  describe("Mobile Navbar - Authenticated User", () => {
    beforeEach(() => {
      cy.viewport("iphone-6");
      cy.mockAuthenticatedUser();
    });

    it("should not show Login in mobile menu when authenticated", () => {
      cy.get('button[aria-label="Open menu"]').click();

      cy.get('[role="dialog"]').within(() => {
        cy.contains("a", "Login").should("not.exist");
      });
    });

    it("should show user options in mobile menu when authenticated", () => {
      cy.get('button[aria-label="Open menu"]').click();

      cy.get('[role="dialog"]').within(() => {
        // Ajusta según tu implementación de usuario autenticado
        cy.get('[data-testid="mobile-user-menu"]')
          .should("exist")
          .or(cy.contains("button", "Logout").should("exist"))
          .or(cy.contains("Perfil").should("exist"));
      });
    });
  });

  describe("Authentication Flow", () => {
    it("should redirect to login when accessing protected routes while unauthenticated", () => {
      // Intenta acceder a una ruta protegida
      cy.visit("/admin/resident");

      // Debería redirigir a login o mostrar mensaje de acceso denegado
      cy.url().should("satisfy", (url) => {
        return url.includes("/login") || url.includes("/unauthorized");
      });
    });

    it("should handle login callback and redirect appropriately", () => {
      // Visitar login con callbackUrl
      cy.visit("/login?callbackUrl=%2Fadmin%2Fresident");

      cy.contains("Login with Google").should("be.visible");

      // Nota: No podemos probar realmente el flujo de Google OAuth en Cypress
      // pero podemos verificar que la página de login está configurada correctamente
    });
  });

  describe("Responsive Behavior", () => {
    it("should hide desktop menu and show mobile menu on small screens", () => {
      // Desktop
      cy.viewport(1280, 720);
      cy.get("nav").within(() => {
        cy.contains("button", "Administrador").should("be.visible");
      });
      cy.get('button[aria-label="Open menu"]').should("not.be.visible");

      // Mobile
      cy.viewport("iphone-6");
      cy.get("nav").within(() => {
        cy.contains("button", "Administrador").should("not.be.visible");
      });
      cy.get('button[aria-label="Open menu"]').should("be.visible");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      cy.viewport("iphone-6");
      cy.get('button[aria-label="Open menu"]').should("exist");

      cy.get('button[aria-label="Open menu"]').click();
      cy.get('[role="dialog"]').should("exist");
    });

    it("should be keyboard navigable", () => {
      cy.get("body").tab();
      cy.focused().should("contain", "ReQuiEM");

      cy.focused().tab();
      cy.focused().should("contain", "Dashboard");

      cy.focused().tab();
      cy.focused().should("contain", "Registros");
    });
  });
});

export {};
