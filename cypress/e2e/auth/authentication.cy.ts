describe("Authentication Flow", () => {
  beforeEach(() => {
    cy.clearDatabase();
    cy.visit("/");
  });

  afterEach(() => {
    cy.clearDatabase();
  });

  describe("Landing Page", () => {
    it("should display the landing page for unauthenticated users", () => {
      cy.get('[data-testid="landing-page"]').should("be.visible");
      cy.get('[data-testid="login-button"]').should("be.visible");
      cy.get('[data-testid="app-title"]').should("contain.text", "ReQuiEM");
    });

    it("should have working login button", () => {
      cy.get('[data-testid="login-button"]').click();
      cy.url().should("include", "/login");
    });

    it("should be responsive on mobile", () => {
      cy.setMobileViewport();
      cy.get('[data-testid="landing-page"]').should("be.visible");
      cy.get('[data-testid="mobile-menu-button"]').should("be.visible");
    });
  });

  describe("Sign In Page", () => {
    beforeEach(() => {
      cy.visit("/login");
    });

    it("should display sign in options", () => {
      cy.get('[data-testid="signin-page"]').should("be.visible");
      cy.get('[data-testid="google-signin-button"]').should("be.visible");
      cy.get('[data-testid="microsoft-signin-button"]').should("be.visible");
    });

    it("should show provider buttons with correct text", () => {
      cy.get('[data-testid="google-signin-button"]')
        .should("contain.text", "Google")
        .should("be.enabled");

      cy.get('[data-testid="microsoft-signin-button"]')
        .should("contain.text", "Microsoft")
        .should("be.enabled");
    });

    it("should handle Google OAuth flow", () => {
      // Mock the OAuth response
      cy.intercept("GET", "**/api/auth/signin/google", {
        statusCode: 200,
        body: { url: "http://localhost:3000/dashboard" },
      }).as("googleAuth");

      cy.get('[data-testid="google-signin-button"]').click();
      cy.waitForApiCall("@googleAuth");
    });

    it("should handle Microsoft OAuth flow", () => {
      // Mock the OAuth response
      cy.intercept("GET", "**/api/auth/signin/azure-ad", {
        statusCode: 200,
        body: { url: "http://localhost:3000/dashboard" },
      }).as("microsoftAuth");

      cy.get('[data-testid="microsoft-signin-button"]').click();
      cy.waitForApiCall("@microsoftAuth");
    });

    it("should be accessible", () => {
      // Check for proper ARIA labels
      cy.get('[data-testid="signin-page"]').should("have.attr", "role", "main");
      cy.get('[data-testid="google-signin-button"]').should(
        "have.attr",
        "aria-label"
      );
      cy.get('[data-testid="microsoft-signin-button"]').should(
        "have.attr",
        "aria-label"
      );
    });
  });

  describe("Authentication Success", () => {
    it("should redirect resident to dashboard after successful login", () => {
      cy.loginAsResident();
      cy.url().should("include", "/dashboard");
      cy.get('[data-testid="dashboard-page"]').should("be.visible");
      cy.get('[data-testid="user-greeting"]').should(
        "contain.text",
        "Test Resident"
      );
    });

    it("should redirect teacher to dashboard after successful login", () => {
      cy.loginAsTeacher();
      cy.url().should("include", "/dashboard");
      cy.get('[data-testid="dashboard-page"]').should("be.visible");
      cy.get('[data-testid="user-greeting"]').should(
        "contain.text",
        "Test Teacher"
      );
    });

    it("should redirect admin to dashboard after successful login", () => {
      cy.loginAsAdmin();
      cy.url().should("include", "/dashboard");
      cy.get('[data-testid="dashboard-page"]').should("be.visible");
      cy.get('[data-testid="user-greeting"]').should(
        "contain.text",
        "Test Admin"
      );
    });

    it("should show correct navigation for resident", () => {
      cy.loginAsResident();
      cy.get('[data-testid="nav-dashboard"]').should("be.visible");
      cy.get('[data-testid="nav-records"]').should("be.visible");
      cy.get('[data-testid="nav-admin"]').should("not.exist");
      cy.get('[data-testid="nav-supervision"]').should("not.exist");
    });

    it("should show correct navigation for teacher", () => {
      cy.loginAsTeacher();
      cy.get('[data-testid="nav-dashboard"]').should("be.visible");
      cy.get('[data-testid="nav-supervision"]').should("be.visible");
      cy.get('[data-testid="nav-admin"]').should("not.exist");
      cy.get('[data-testid="nav-records"]').should("not.exist");
    });

    it("should show correct navigation for admin", () => {
      cy.loginAsAdmin();
      cy.get('[data-testid="nav-dashboard"]').should("be.visible");
      cy.get('[data-testid="nav-admin"]').should("be.visible");
      cy.get('[data-testid="nav-records"]').should("not.exist");
      cy.get('[data-testid="nav-supervision"]').should("not.exist");
    });
  });

  describe("Session Management", () => {
    it("should maintain session across page refreshes", () => {
      cy.loginAsResident();
      cy.get('[data-testid="user-greeting"]').should(
        "contain.text",
        "Test Resident"
      );

      cy.reload();
      cy.get('[data-testid="user-greeting"]').should(
        "contain.text",
        "Test Resident"
      );
    });

    it("should handle session expiration gracefully", () => {
      cy.loginAsResident();

      // Mock session expiration
      cy.clearLocalStorage();
      cy.clearCookies();

      cy.visit("/dashboard");
      cy.url().should("include", "/login");
    });

    it("should redirect to intended page after login", () => {
      // Try to access protected page while not authenticated
      cy.visit("/records");
      cy.url().should("include", "/login");

      // Login and should redirect back to records
      cy.loginAsResident();
      cy.url().should("include", "/records");
    });
  });

  describe("Sign Out", () => {
    beforeEach(() => {
      cy.loginAsResident();
    });

    it("should sign out successfully", () => {
      cy.get('[data-testid="user-menu-button"]').click();
      cy.get('[data-testid="signout-button"]').click();

      cy.url().should("eq", Cypress.config().baseUrl + "/");
      cy.get('[data-testid="landing-page"]').should("be.visible");
    });

    it("should clear session data on sign out", () => {
      cy.logout();

      // Try to access protected page
      cy.visit("/dashboard");
      cy.url().should("include", "/login");
    });

    it("should handle sign out from different pages", () => {
      cy.visit("/records");
      cy.get('[data-testid="user-menu-button"]').click();
      cy.get('[data-testid="signout-button"]').click();

      cy.url().should("eq", Cypress.config().baseUrl + "/");
    });
  });

  describe("Protected Routes", () => {
    const protectedRoutes = ["/dashboard", "/records", "/profile", "/settings"];

    protectedRoutes.forEach((route) => {
      it(`should redirect unauthenticated users from ${route}`, () => {
        cy.visit(route);
        cy.url().should("include", "/login");
      });
    });

    it("should allow authenticated users to access protected routes", () => {
      cy.loginAsResident();

      protectedRoutes.forEach((route) => {
        cy.visit(route);
        cy.url().should("include", route);
      });
    });
  });

  describe("Role-based Access Control", () => {
    it("should prevent residents from accessing admin routes", () => {
      cy.loginAsResident();
      cy.visit("/admin");
      cy.get('[data-testid="access-denied"]').should("be.visible");
    });

    it("should prevent residents from accessing teacher routes", () => {
      cy.loginAsResident();
      cy.visit("/supervision");
      cy.get('[data-testid="access-denied"]').should("be.visible");
    });

    it("should allow teachers to access supervision routes", () => {
      cy.loginAsTeacher();
      cy.visit("/supervision");
      cy.get('[data-testid="supervision-page"]').should("be.visible");
    });

    it("should allow admins to access admin routes", () => {
      cy.loginAsAdmin();
      cy.visit("/admin");
      cy.get('[data-testid="admin-page"]').should("be.visible");
    });

    it("should allow admins to access all routes", () => {
      cy.loginAsAdmin();

      const allRoutes = ["/dashboard", "/admin", "/supervision"];
      allRoutes.forEach((route) => {
        cy.visit(route);
        cy.url().should("include", route);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle OAuth errors gracefully", () => {
      cy.visit("/login");

      // Mock OAuth error
      cy.intercept("GET", "**/api/auth/signin/google", {
        statusCode: 500,
        body: { error: "OAuth error" },
      }).as("googleAuthError");

      cy.get('[data-testid="google-signin-button"]').click();
      cy.waitForApiCall("@googleAuthError");

      cy.get('[data-testid="error-message"]').should("be.visible");
    });

    it("should handle network errors during authentication", () => {
      cy.visit("/login");

      // Mock network error
      cy.intercept("GET", "**/api/auth/signin/google", {
        forceNetworkError: true,
      }).as("networkError");

      cy.get('[data-testid="google-signin-button"]').click();
      cy.waitForApiCall("@networkError");

      cy.get('[data-testid="error-message"]').should("be.visible");
    });
  });
});
