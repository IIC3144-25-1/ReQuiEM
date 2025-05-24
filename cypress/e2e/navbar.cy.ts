describe("Navbar End-to-End Tests", () => {
  beforeEach(() => {
    // Visitar la página principal antes de cada prueba
    cy.visit("/");
  });

  describe("Desktop Navbar", () => {
    it("should display the Navbar with logo", () => {
      cy.get("nav").should("be.visible");
      cy.contains("a", "ReQuiEM")
        .should("be.visible")
        .and("have.attr", "href", "/");
    });

    it("should display main desktop navigation links", () => {
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

    it('should open the "Administrador" dropdown and show its items', () => {
      cy.get("nav").contains("button", "Administrador").click();
      
      // Esperar a que el dropdown sea visible
      cy.get('[role="dialog"]').should("be.visible");
      
      cy.get('[role="dialog"]').within(() => {
        // Verificar todos los items del dropdown Administrador
        cy.contains("a", "Residentes")
          .should("be.visible")
          .and("have.attr", "href", "/admin/resident");
        
        cy.contains("a", "Profesores")
          .should("be.visible");
        
        cy.contains("a", "Cirugias")
          .should("be.visible")
          .and("have.attr", "href", "/admin/surgeries");
        
        cy.contains("a", "Areas")
          .should("be.visible")
          .and("have.attr", "href", "/admin/surgeries");
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

    it('should open the "Residente" dropdown and show its items', () => {
      cy.get("nav").contains("button", "Residente").click();
      
      cy.get('[role="dialog"]').should("be.visible");
      
      cy.get('[role="dialog"]').within(() => {
        cy.contains("a", "Registros")
          .should("be.visible")
          .and("have.attr", "href", "/teacher/records");
        
        cy.contains("a", "Contact Us").should("be.visible");
        cy.contains("a", "Status").should("be.visible");
        cy.contains("a", "Terms of Service").should("be.visible");
      });
    });

    it('should display the "Login" button when no user is authenticated', () => {
      cy.get("nav").within(() => {
        cy.contains("a", "Login")
          .should("be.visible")
          .and("have.attr", "href", "/login");
      });
    });

    it("should close dropdown when clicking outside", () => {
      // Abrir dropdown
      cy.get("nav").contains("button", "Administrador").click();
      cy.get('[role="dialog"]').should("be.visible");
      
      // Hacer click fuera del dropdown
      cy.get("body").click(0, 0);
      
      // Verificar que se cerró
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

  describe("Mobile Navbar", () => {
    beforeEach(() => {
      // Establecer viewport móvil
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

    it("should open the mobile menu sheet and display items", () => {
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

    it("should close mobile menu when clicking close button", () => {
      cy.get('button[aria-label="Open menu"]').click();
      cy.get('[role="dialog"]').should("be.visible");
      
      // Buscar botón de cerrar (puede variar según tu implementación)
      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Close menu"]').click();
      });
      
      cy.get('[role="dialog"]').should("not.exist");
    });

    it("should navigate from mobile menu", () => {
      cy.get('button[aria-label="Open menu"]').click();
      cy.get('[role="dialog"]').contains("a", "Dashboard").click();
      cy.url().should("include", "/dashboard");
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
      // Navegar con Tab
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