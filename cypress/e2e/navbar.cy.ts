describe("Navbar End-to-End Tests", () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit("/");
  });

  it("should display the Navbar with logo and default title", () => {
    cy.get("nav").should("be.visible"); // Checks if the main nav element is present
    cy.contains("a", "ReQuiEM")
      .should("be.visible")
      .and("have.attr", "href", "/");
  });

  it("should display main desktop navigation links", () => {
    cy.get("nav").within(() => {
      // Scope queries to within the desktop nav
      cy.contains("button", "Dashboard").should("not.exist"); // Dashboard is a direct link, not a button
      cy.contains("a", "Dashboard")
        .should("be.visible")
        .and("have.attr", "href", "/dashboard");
      cy.contains("button", "Registros").should("be.visible");
      cy.contains("button", "Administrador").should("be.visible");
      cy.contains("button", "Residente").should("be.visible");
    });
  });

  it('should open the "Administrador" dropdown and show its items on desktop', () => {
    cy.get("nav").contains("button", "Administrador").click();
    // Wait for dropdown to be visible if it has animation
    cy.get('div[role="dialog"]').should("be.visible"); // Assuming dropdown content is in a dialog or similar container
    cy.get('div[role="dialog"]').within(() => {
      cy.contains("a", "Residentes")
        .should("be.visible")
        .and("have.attr", "href", "/admin/resident");
      cy.contains("a", "Profesores").should("be.visible"); // Add href check if available
      cy.contains("a", "Cirugias")
        .should("be.visible")
        .and("have.attr", "href", "/admin/surgeries");
      cy.contains("a", "Areas")
        .should("be.visible")
        .and("have.attr", "href", "/admin/surgeries"); // Assuming same URL as Cirugias based on navbar.tsx
    });
  });

  it('should display the "Login" button when no user is authenticated', () => {
    // This test assumes no user is logged in by default for E2E.
    // If you have a way to ensure logout or test with a clean session, that's better.
    cy.get("nav").within(() => {
      cy.contains("a", "Login")
        .should("be.visible")
        .and("have.attr", "href", "/login");
    });
  });

  // Mobile Menu Tests
  describe("Mobile Navbar", () => {
    beforeEach(() => {
      // Set viewport to a mobile size
      cy.viewport("iphone-6");
    });

    it("should display the mobile menu trigger and logo", () => {
      cy.get("div.lg\\:hidden").should("be.visible"); // Container for mobile menu
      cy.get("div.lg\\:hidden")
        .contains("a", "ReQuiEM")
        .should("be.visible")
        .and("have.attr", "href", "/");
      cy.get('div.lg\\:hidden button[aria-label="Open menu"]').should(
        "be.visible"
      ); // More specific selector if possible
    });

    it("should open the mobile menu sheet and display items", () => {
      cy.get('div.lg\\:hidden button[aria-label="Open menu"]').click(); // Adjust selector if needed

      cy.get('div[role="dialog"]').should("be.visible"); // Sheet content
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("a", "ReQuiEM").should("be.visible"); // Logo in sheet
        cy.contains("a", "Dashboard").should("be.visible");
        cy.contains("button", "Registros").should("be.visible"); // Accordion trigger
        cy.contains("button", "Administrador").should("be.visible"); // Accordion trigger
        cy.contains("a", "Login").should("be.visible");
      });
    });

    it("should open an accordion item in the mobile menu", () => {
      cy.get('div.lg\\:hidden button[aria-label="Open menu"]').click();
      cy.get('div[role="dialog"]').contains("button", "Administrador").click();

      cy.get('div[role="dialog"]').within(() => {
        cy.contains("a", "Residentes")
          .should("be.visible")
          .and("have.attr", "href", "/admin/resident");
        cy.contains("a", "Profesores").should("be.visible");
      });
    });
  });
});

// To make this file a module
export {};
