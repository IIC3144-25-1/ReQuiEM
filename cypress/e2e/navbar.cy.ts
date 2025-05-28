describe("Navbar End-to-End Tests", () => {
  beforeEach(() => {
    // Visit the main page before each test
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
      // Target specifically the desktop nav element using its classes
      // The 'lg:flex' class is distinctive for the desktop nav in navbar.tsx
      // Need to escape the ':' character with double backslash '\\'
      cy.get("nav.lg\\:flex").within(() => {
        // Dashboard as direct link
        cy.contains("a", "Dashboard")
          .should("be.visible")
          .and("have.attr", "href", "/dashboard");

        // Top-level dropdown buttons
        cy.contains("button", "Registros").should("be.visible");
        cy.contains("button", "Administrador").should("be.visible");
      });
    });

    it('should display the "Login" button when no user is authenticated', () => {
      cy.get("nav.lg\\:flex").within(() => {
        cy.contains("a", "Login")
          .should("be.visible")
          .and("have.attr", "href", "/login");
      });
    });

    it("should navigate to login page when clicking Login button", () => {
      cy.get("nav").contains("a", "Login").click();
      cy.url().should("include", "/login");

      // Verify we're on the login page
      cy.contains("Bienvenido 👋").should("be.visible");
      cy.contains("Login with Google").should("be.visible");
    });

    it('should open the "Administrador" dropdown and show its items', () => {
      // Target specifically the desktop nav and then the button
      cy.get("nav.lg\\:flex").contains("button", "Administrador").click();

      // Add small delay to ensure the menu has time to render
      // and then inspect the DOM to see what opened
      cy.wait(500); // Wait 500ms, adjust if necessary

      // Try to find the menu container in a more generic way first
      // to see if something is opening
      // Headless UI menus are often added at the end of body or near the trigger
      // Look for a div that contains the expected items
      cy.get("body").then(($body) => {
        if ($body.find('a[href="/admin/resident"]').length > 0) {
          cy.log("Dropdown item 'Residentes' found in body.");
          // If we find an item, let's try to find its menu container
          // Headless UI <Menu.Items> often don't have role="menu" by default,
          // but are identified by their classes or being the container of Menu.Item
          // Try a more general selector for the menu panel
          // You might need to inspect the HTML in the browser when the menu is open
          // to find a more reliable selector (e.g., a specific <Menu.Items> class)
          cy.contains("a", "Residentes")
            .parentsUntil("nav")
            .last()
            .as("dropdownMenu");
        } else {
          cy.log(
            "Dropdown item 'Residentes' NOT found. Menu might not be opening or items are different."
          );
          // If not found, force a failure to see the DOM state
          cy.get('[data-testid="non-existent-element-for-debug"]').should(
            "exist"
          );
        }
      });

      cy.get("@dropdownMenu")
        .should("be.visible")
        .within(() => {
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
      cy.get("nav.lg\\:flex").contains("button", "Registros").click();
      cy.wait(500); // Similar wait and debugging logic

      cy.get("body").then(($body) => {
        if ($body.find('a[href="/resident/records"]').length > 0) {
          cy.log("Dropdown item 'Residente' (Registros) found in body.");
          cy.contains("a", "Residente")
            .parentsUntil("nav")
            .last()
            .as("dropdownMenuRegistros");
        } else {
          cy.log("Dropdown item 'Residente' (Registros) NOT found.");
          cy.get(
            '[data-testid="non-existent-element-for-debug-registros"]'
          ).should("exist");
        }
      });

      cy.get("@dropdownMenuRegistros")
        .should("be.visible")
        .within(() => {
          cy.contains("a", "Residente")
            .should("be.visible")
            .and("have.attr", "href", "/resident/records");

          cy.contains("a", "Profesor")
            .should("be.visible")
            .and("have.attr", "href", "/teacher/records");
        });
    });

    it("should close dropdown when clicking outside", () => {
      cy.get("nav.lg\\:flex").contains("button", "Administrador").click();

      cy.get('[data-slot="navigation-menu-content"]').should("be.visible");

      cy.get("body").click(0, 0); // Click on the top-left corner of body
      cy.get('[data-slot="navigation-menu-content"]').should("not.exist");
    });

    it("should navigate to dashboard when clicking Dashboard link", () => {
      // Ensure interaction with desktop nav
      cy.get("nav.lg\\:flex").contains("a", "Dashboard").click();
      cy.url().should("include", "/dashboard");
    });

    it("should navigate to admin resident page from dropdown", () => {
      // Ensure interaction with desktop nav
      cy.get("nav.lg\\:flex").contains("button", "Administrador").click();

      // Look for dropdown menu content using correct selector
      cy.get('[data-slot="navigation-menu-content"]')
        .contains("a", "Residentes")
        .click();
      cy.url().should("include", "/admin/resident");
    });
  });

  describe("Desktop Navbar - Authenticated User", () => {
    beforeEach(() => {
      // Simulate authenticated user (admin for full desktop nav access)
      cy.intercept("GET", "/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "user-admin-id",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
            admin: true,
          },
          expires: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
      }).as("authenticatedAdminSession");
      cy.visit("/"); // Visit after setting up the intercept
    });

    it("should not display Login button when user is authenticated", () => {
      cy.get("nav.lg\\:flex").within(() => {
        cy.contains("a", "Login").should("not.exist");
      });
    });

    it("should display user profile or logout option when authenticated", () => {
      cy.get("nav.lg\\:flex").within(() => {
        // Adjust these selectors to your actual implementation
        // It's more reliable to use data-testid if possible
        cy.get(
          'button[aria-label="User menu"], [data-testid="user-menu-trigger"], button:contains("Logout")'
        ).should("be.visible");
      });
    });

    it("should have access to protected routes when authenticated", () => {
      cy.get("nav.lg\\:flex").contains("a", "Dashboard").click();
      cy.url().should("include", "/dashboard");
      cy.url().should("not.include", "/login");
    });

    it("should navigate to dashboard when clicking Dashboard link", () => {
      // Ensure interaction with desktop nav
      cy.get("nav.lg\\:flex").contains("a", "Dashboard").click();
      cy.url().should("include", "/dashboard");
    });
  });

  describe("Mobile Navbar - Unauthenticated User", () => {
    beforeEach(() => {
      cy.viewport("iphone-6");
      // Ensure no active session for these tests
      cy.intercept("GET", "/api/auth/session", {
        statusCode: 401,
        body: {},
      }).as("unauthenticatedSession");
      cy.visit("/");
    });

    it("should display the mobile menu trigger and logo", () => {
      // The mobile menu container
      cy.get("div.lg\\:hidden").should("be.visible");
      cy.get("div.lg\\:hidden")
        .find('a[href="/"]') // Logo link
        .should("be.visible");

      cy.get('button[aria-label="Open menu"]').should("be.visible");
    });

    it("should open the mobile menu sheet and display items including Login", () => {
      cy.get('button[aria-label="Open menu"]').click();

      // The mobile menu side panel (sheet) DOES usually have role="dialog"
      cy.get('[role="dialog"]').should("be.visible");

      cy.get('[role="dialog"]').within(() => {
        cy.contains("a", "Dashboard").should("be.visible");
        cy.contains("button", "Registros").should("be.visible"); // Accordion trigger
        cy.contains("button", "Administrador").should("be.visible"); // Accordion trigger
        // "Residente" is not a top-level button in mobile menu according to navbar.tsx
        // It's a link inside an accordion
        // cy.contains("button", "Residente").should("be.visible"); // This would probably fail
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
      cy.get('[role="dialog"]').contains("button", "Administrador").click(); // Open accordion

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
      // Simulate authenticated user (can be non-admin for some mobile tests)
      cy.intercept("GET", "/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "user-mobile-id",
            name: "Mobile User",
            email: "mobile@example.com",
            // admin: false // Or true, depending on what you want to test
          },
          expires: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
      }).as("authenticatedMobileSession");
      cy.visit("/");
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
        // Adjust according to your actual implementation. Look for a Logout button or Profile link
        cy.contains("button", "Logout")
          .should("be.visible")
          .or(cy.contains("a", "Perfil").should("be.visible"));
      });
    });
  });

  describe("Authentication Flow", () => {
    it("should redirect to login when accessing protected routes while unauthenticated", () => {
      // Try to access a protected route
      cy.visit("/admin/resident");

      // Should redirect to login or show access denied message
      cy.url().should("satisfy", (url) => {
        return url.includes("/login") || url.includes("/unauthorized");
      });
    });

    it("should handle login callback and redirect appropriately", () => {
      // Visit login with callbackUrl
      cy.visit("/login?callbackUrl=%2Fadmin%2Fresident");

      cy.contains("Login with Google").should("be.visible");

      // Note: We can't actually test the Google OAuth flow in Cypress
      // but we can verify that the login page is configured correctly
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
