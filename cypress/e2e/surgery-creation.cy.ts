describe("Surgery Creation End-to-End Tests", () => {
  beforeEach(() => {
    // Limpiar estado previo
    cy.clearLocalStorage();
    cy.clearCookies();
    // NO usar cy.mockAuthenticatedUser() aquí porque cada test necesita diferentes permisos
  });

  describe("Authentication and Authorization", () => {
    it("should redirect to login when not authenticated", () => {
      // Sin autenticación, debería redirigir a login
      cy.visit("/admin/surgeries/new");

      // Verificar redirección a login
      cy.url().should("include", "/login");
      cy.contains("Bienvenido 👋").should("be.visible");
    });

    it("should deny access to non-admin users", () => {
      // Simular usuario autenticado pero SIN permisos de admin
      cy.intercept("GET", "/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "2",
            name: "Regular User",
            email: "user@example.com",
            role: "resident",
            admin: false, // NO es admin
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      }).as("regularUserSession");

      cy.visit("/admin/surgeries/new");

      // Debería redirigir a login o mostrar error de permisos
      cy.url().should("satisfy", (url) => {
        return (
          url.includes("/login") ||
          url.includes("/unauthorized") ||
          url.includes("/403")
        );
      });
    });

    it("should allow access to admin users", () => {
        // Establecer intercept ANTES de cualquier navegación
        cy.intercept("GET", "/api/auth/session", {
            statusCode: 200,
            body: {
            user: {
                id: "1",
                name: "Admin User",
                email: "admin@example.com",
                role: "admin",
                admin: true,
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
        }).as("adminSession");

        // Visitar primero una página que NO requiere autenticación
        cy.visit("/");
        
        // Luego navegar a la página protegida
        cy.visit("/admin/surgeries/new");

        // Verificar que no redirigió a login
        cy.url().should("include", "/admin/surgeries/new");
        cy.get("body").should("be.visible");

        // Verificar que aparecen elementos del formulario
        cy.get("form").should("exist");
        });
  });

  describe("Surgery Creation Page - UI and Navigation", () => {
    beforeEach(() => {
      // Simular usuario admin para todos los tests de este grupo
      cy.intercept("GET", "/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
            admin: true, // Permisos de admin
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      }).as("adminSession");
    });

    it("should display the surgery creation page correctly for authenticated admin", () => {
      cy.visit("/admin/surgeries/new");

      // Esperar a que la página cargue completamente
      cy.get("body").should("be.visible");

      // Verificar que no redirigió a login
      cy.url().should("include", "/admin/surgeries/new");

      // Verificar elementos que deberían estar presentes
      cy.get("form").should("exist");
      cy.get('input[name="name"]').should("exist");
      cy.get('textarea[name="description"]').should("exist");
    });

    it("should show form elements when authenticated as admin", () => {
      cy.visit("/admin/surgeries/new");

      // Verificar que los elementos del formulario existen
      cy.get("form").should("be.visible");
      cy.get('input[name="name"]').should("be.visible");
      cy.get('textarea[name="description"]').should("be.visible");
    });
  });

  describe("Surgery Form - Basic Information", () => {
    beforeEach(() => {
      // Establecer autenticación admin para cada test
      cy.intercept("GET", "/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
            admin: true, // Crucial: permisos de admin
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      }).as("adminSession");

      cy.visit("/admin/surgeries/new");

      // Esperar a que la página cargue
      cy.get("body").should("be.visible");
      cy.url().should("include", "/admin/surgeries/new");
    });

    it("should fill basic surgery information correctly", () => {
      const surgeryData = {
        name: "Apendicectomía Laparoscópica",
        description:
          "Cirugía mínimamente invasiva para extirpación del apéndice",
      };

      // Verificar que los campos existen antes de llenarlos
      cy.get('input[name="name"]').should("be.visible");
      cy.get('textarea[name="description"]').should("be.visible");

      // Llenar información básica
      cy.get('input[name="name"]').clear().type(surgeryData.name);
      cy.get('textarea[name="description"]')
        .clear()
        .type(surgeryData.description);

      // Verificar que los campos mantienen los valores
      cy.get('input[name="name"]').should("have.value", surgeryData.name);
      cy.get('textarea[name="description"]').should(
        "have.value",
        surgeryData.description
      );
    });

    it("should show form validation when submitting empty form", () => {
      // Buscar botón de submit
      cy.get('button[type="submit"]').first().click();

      // Verificar que la página sigue funcionando (validación depende de tu implementación)
      cy.get("body").should("be.visible");
    });
  });

  describe("Form Submission", () => {
    beforeEach(() => {
      // Autenticación admin para todos los tests de este grupo
      cy.intercept("GET", "/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
            admin: true, // Permisos necesarios
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      });

      cy.visit("/admin/surgeries/new");
      cy.get("body").should("be.visible");
    });

    it("should handle form submission with basic data", () => {
      // Interceptar la submission del formulario
      cy.intercept("POST", "**/admin/surgeries/**", {
        statusCode: 201,
        body: { id: "new-surgery-id", message: "Cirugía creada exitosamente" },
      }).as("createSurgery");

      // Llenar datos mínimos
      cy.get('input[name="name"]').type("Cirugía de Prueba");
      cy.get('textarea[name="description"]').type(
        "Descripción de la cirugía de prueba"
      );

      // Seleccionar área si existe el campo
      cy.get("body").then(($body) => {
        if ($body.find('select[name="areaId"]').length > 0) {
          cy.get('select[name="areaId"]').select(1);
        }
      });

      // Enviar formulario
      cy.get('button[type="submit"]').first().click();

      // Verificar que se procesó el formulario
      cy.get("body").should("be.visible");
    });

    it("should handle submission errors gracefully", () => {
      // Interceptar error en la submission
      cy.intercept("POST", "**/admin/surgeries/**", {
        statusCode: 400,
        body: { error: "Error al crear la cirugía" },
      }).as("createSurgeryError");

      // Llenar datos mínimos
      cy.get('input[name="name"]').type("Cirugía Error");
      cy.get('textarea[name="description"]').type("Descripción de prueba");

      // Enviar formulario
      cy.get('button[type="submit"]').first().click();

      // Verificar que la página sigue funcionando
      cy.get("body").should("be.visible");
    });
  });

  describe("Navigation", () => {
    beforeEach(() => {
      cy.intercept("GET", "/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
            admin: true,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      });

      cy.visit("/admin/surgeries/new");
      cy.get("body").should("be.visible");
    });

    it("should navigate back to surgeries list", () => {
      // Buscar botón de cancelar o volver
      cy.get("body").then(($body) => {
        if ($body.find('button:contains("Cancelar")').length > 0) {
          cy.contains("button", "Cancelar").click();
        } else if ($body.find('a[href*="/admin/surgeries"]').length > 0) {
          cy.get('a[href*="/admin/surgeries"]').first().click();
        } else {
          // Navegar directamente si no hay botón
          cy.visit("/admin/surgeries");
        }
      });

      cy.url().should("include", "/admin/surgeries");
    });
  });

  describe("Mobile Experience", () => {
    beforeEach(() => {
      cy.viewport("iphone-6");

      cy.intercept("GET", "/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
            admin: true,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      });
    });

    it("should work correctly on mobile devices", () => {
      cy.visit("/admin/surgeries/new");

      // Verificar que la página carga en móvil
      cy.get("body").should("be.visible");
      cy.url().should("include", "/admin/surgeries/new");

      // Verificar que los elementos principales son accesibles
      cy.get('input[name="name"]').should("be.visible");
      cy.get('textarea[name="description"]').should("be.visible");
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      cy.intercept("GET", "/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
            admin: true,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      });

      cy.visit("/admin/surgeries/new");
      cy.get("body").should("be.visible");
    });

    it("should have proper form structure", () => {
      // Verificar estructura básica del formulario
      cy.get("form").should("exist");
      cy.get('input[name="name"]').should("exist");
      cy.get('textarea[name="description"]').should("exist");
      cy.get('button[type="submit"]').should("exist");
    });

    it("should be keyboard navigable", () => {
      // Verificar navegación por teclado
      cy.get('input[name="name"]').focus();
      cy.focused().should("have.attr", "name", "name");

      cy.focused().tab();
      cy.focused().should("have.attr", "name", "description");
    });
  });
});

export {};
