describe("Authentication Flow", () => {
  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visit the login page
    cy.visit("/login");
  });

  describe("Login Page", () => {
    it("should display login form", () => {
      cy.get('[data-testid="login-form"]').should("be.visible");
      cy.get('[data-testid="google-login-button"]').should("be.visible");
      cy.get('[data-testid="microsoft-login-button"]').should("be.visible");
      
      // Check page title and content
      cy.title().should("contain", "Login");
      cy.contains("Iniciar Sesión").should("be.visible");
      cy.contains("Bienvenido a ReQuiEM").should("be.visible");
    });

    it("should have proper accessibility attributes", () => {
      cy.get('[data-testid="login-form"]')
        .should("have.attr", "role", "form");
      
      cy.get('[data-testid="google-login-button"]')
        .should("have.attr", "aria-label")
        .and("contain", "Google");
      
      cy.get('[data-testid="microsoft-login-button"]')
        .should("have.attr", "aria-label")
        .and("contain", "Microsoft");
    });

    it("should redirect to home when already authenticated", () => {
      // Mock authenticated session
      cy.window().then((win) => {
        win.localStorage.setItem("next-auth.session-token", "mock-token");
      });
      
      cy.visit("/login");
      cy.url().should("eq", Cypress.config().baseUrl + "/");
    });
  });

  describe("Google OAuth Login", () => {
    it("should initiate Google OAuth flow", () => {
      // Mock Google OAuth
      cy.intercept("GET", "**/api/auth/signin/google", {
        statusCode: 302,
        headers: {
          location: "https://accounts.google.com/oauth/authorize?*"
        }
      }).as("googleOAuth");

      cy.get('[data-testid="google-login-button"]').click();
      
      cy.wait("@googleOAuth");
      
      // Should redirect to Google OAuth
      cy.url().should("include", "accounts.google.com");
    });

    it("should handle successful Google login", () => {
      // Mock successful OAuth callback
      cy.intercept("GET", "**/api/auth/callback/google*", {
        statusCode: 302,
        headers: {
          location: "/"
        }
      }).as("googleCallback");

      // Mock session endpoint
      cy.intercept("GET", "**/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "test-user-id",
            name: "Test User",
            email: "test@example.com",
            role: "resident",
            rut: "12.345.678-5"
          },
          expires: "2024-12-31T23:59:59.999Z"
        }
      }).as("getSession");

      // Simulate OAuth callback
      cy.visit("/api/auth/callback/google?code=mock-code&state=mock-state");
      
      cy.wait("@googleCallback");
      cy.wait("@getSession");
      
      // Should redirect to dashboard
      cy.url().should("eq", Cypress.config().baseUrl + "/");
    });

    it("should handle Google login errors", () => {
      // Mock OAuth error
      cy.intercept("GET", "**/api/auth/callback/google*", {
        statusCode: 400,
        body: { error: "OAuth error" }
      }).as("googleError");

      cy.visit("/api/auth/callback/google?error=access_denied");
      
      cy.wait("@googleError");
      
      // Should redirect back to login with error
      cy.url().should("include", "/login");
      cy.contains("Error de autenticación").should("be.visible");
    });
  });

  describe("Microsoft OAuth Login", () => {
    it("should initiate Microsoft OAuth flow", () => {
      // Mock Microsoft OAuth
      cy.intercept("GET", "**/api/auth/signin/azure-ad", {
        statusCode: 302,
        headers: {
          location: "https://login.microsoftonline.com/oauth/authorize?*"
        }
      }).as("microsoftOAuth");

      cy.get('[data-testid="microsoft-login-button"]').click();
      
      cy.wait("@microsoftOAuth");
      
      // Should redirect to Microsoft OAuth
      cy.url().should("include", "login.microsoftonline.com");
    });

    it("should handle successful Microsoft login", () => {
      // Mock successful OAuth callback
      cy.intercept("GET", "**/api/auth/callback/azure-ad*", {
        statusCode: 302,
        headers: {
          location: "/"
        }
      }).as("microsoftCallback");

      // Mock session endpoint
      cy.intercept("GET", "**/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "test-user-id",
            name: "Test User",
            email: "test@university.edu",
            role: "teacher",
            rut: "98.765.432-1"
          },
          expires: "2024-12-31T23:59:59.999Z"
        }
      }).as("getSession");

      // Simulate OAuth callback
      cy.visit("/api/auth/callback/azure-ad?code=mock-code&state=mock-state");
      
      cy.wait("@microsoftCallback");
      cy.wait("@getSession");
      
      // Should redirect to dashboard
      cy.url().should("eq", Cypress.config().baseUrl + "/");
    });
  });

  describe("Role-based Redirects", () => {
    it("should redirect admin users to admin dashboard", () => {
      // Mock admin session
      cy.intercept("GET", "**/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "admin-user-id",
            name: "Admin User",
            email: "admin@hospital.cl",
            role: "admin",
            rut: "11.111.111-1"
          },
          expires: "2024-12-31T23:59:59.999Z"
        }
      }).as("getAdminSession");

      cy.visit("/");
      cy.wait("@getAdminSession");
      
      // Should show admin navigation
      cy.get('[data-testid="admin-nav"]').should("be.visible");
      cy.contains("Administración").should("be.visible");
    });

    it("should redirect teacher users to teacher dashboard", () => {
      // Mock teacher session
      cy.intercept("GET", "**/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "teacher-user-id",
            name: "Teacher User",
            email: "teacher@hospital.cl",
            role: "teacher",
            rut: "22.222.222-2"
          },
          expires: "2024-12-31T23:59:59.999Z"
        }
      }).as("getTeacherSession");

      cy.visit("/");
      cy.wait("@getTeacherSession");
      
      // Should show teacher navigation
      cy.get('[data-testid="teacher-nav"]').should("be.visible");
      cy.contains("Docente").should("be.visible");
    });

    it("should redirect resident users to resident dashboard", () => {
      // Mock resident session
      cy.intercept("GET", "**/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "resident-user-id",
            name: "Resident User",
            email: "resident@hospital.cl",
            role: "resident",
            rut: "33.333.333-3"
          },
          expires: "2024-12-31T23:59:59.999Z"
        }
      }).as("getResidentSession");

      cy.visit("/");
      cy.wait("@getResidentSession");
      
      // Should show resident navigation
      cy.get('[data-testid="resident-nav"]').should("be.visible");
      cy.contains("Residente").should("be.visible");
    });
  });

  describe("Logout Flow", () => {
    beforeEach(() => {
      // Mock authenticated session
      cy.intercept("GET", "**/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "test-user-id",
            name: "Test User",
            email: "test@example.com",
            role: "resident",
            rut: "12.345.678-5"
          },
          expires: "2024-12-31T23:59:59.999Z"
        }
      }).as("getSession");

      cy.visit("/");
      cy.wait("@getSession");
    });

    it("should logout user successfully", () => {
      // Mock logout endpoint
      cy.intercept("POST", "**/api/auth/signout", {
        statusCode: 200,
        body: { url: "/login" }
      }).as("signOut");

      // Click logout button
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();
      
      cy.wait("@signOut");
      
      // Should redirect to login page
      cy.url().should("include", "/login");
      cy.contains("Iniciar Sesión").should("be.visible");
    });

    it("should clear session data on logout", () => {
      // Mock logout endpoint
      cy.intercept("POST", "**/api/auth/signout", {
        statusCode: 200,
        body: { url: "/login" }
      }).as("signOut");

      // Mock empty session after logout
      cy.intercept("GET", "**/api/auth/session", {
        statusCode: 200,
        body: {}
      }).as("getEmptySession");

      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();
      
      cy.wait("@signOut");
      
      // Try to access protected route
      cy.visit("/admin");
      cy.wait("@getEmptySession");
      
      // Should redirect to login
      cy.url().should("include", "/login");
    });
  });

  describe("Protected Routes", () => {
    it("should redirect unauthenticated users to login", () => {
      // Mock empty session
      cy.intercept("GET", "**/api/auth/session", {
        statusCode: 200,
        body: {}
      }).as("getEmptySession");

      const protectedRoutes = [
        "/admin",
        "/teacher",
        "/resident",
        "/admin/users",
        "/teacher/records",
        "/resident/records"
      ];

      protectedRoutes.forEach((route) => {
        cy.visit(route);
        cy.wait("@getEmptySession");
        cy.url().should("include", "/login");
      });
    });

    it("should prevent unauthorized role access", () => {
      // Mock resident session
      cy.intercept("GET", "**/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "resident-user-id",
            name: "Resident User",
            email: "resident@hospital.cl",
            role: "resident",
            rut: "33.333.333-3"
          },
          expires: "2024-12-31T23:59:59.999Z"
        }
      }).as("getResidentSession");

      // Try to access admin route as resident
      cy.visit("/admin");
      cy.wait("@getResidentSession");
      
      // Should redirect to unauthorized page
      cy.url().should("include", "/unauthorized");
      cy.contains("No autorizado").should("be.visible");
    });
  });

  describe("Session Management", () => {
    it("should handle session expiration", () => {
      // Mock expired session
      cy.intercept("GET", "**/api/auth/session", {
        statusCode: 401,
        body: { error: "Session expired" }
      }).as("getExpiredSession");

      cy.visit("/");
      cy.wait("@getExpiredSession");
      
      // Should redirect to login
      cy.url().should("include", "/login");
      cy.contains("Sesión expirada").should("be.visible");
    });

    it("should refresh session automatically", () => {
      // Mock initial session
      cy.intercept("GET", "**/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "test-user-id",
            name: "Test User",
            email: "test@example.com",
            role: "resident",
            rut: "12.345.678-5"
          },
          expires: "2024-12-31T23:59:59.999Z"
        }
      }).as("getSession");

      cy.visit("/");
      cy.wait("@getSession");
      
      // Wait for automatic session refresh (typically happens every 15 minutes)
      cy.wait(1000);
      
      // Session should still be valid
      cy.get('[data-testid="user-menu"]').should("be.visible");
    });
  });
});
