// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top;
if (
  app &&
  !app.document.head.querySelector("[data-hide-command-log-request]")
) {
  const style = app.document.createElement("style");
  style.innerHTML =
    ".command-name-request, .command-name-xhr { display: none }";
  style.setAttribute("data-hide-command-log-request", "");
  app.document.head.appendChild(style);
}

// Global error handling
Cypress.on("uncaught:exception", (err: Error) => {
  // Returning false here prevents Cypress from failing the test
  // on uncaught exceptions. We can customize this based on specific errors.

  // Don't fail on Next.js hydration errors
  if (err.message.includes("Hydration failed")) {
    return false;
  }

  // Don't fail on ResizeObserver errors (common in tests)
  if (err.message.includes("ResizeObserver loop limit exceeded")) {
    return false;
  }

  // Don't fail on network errors during development
  if (err.message.includes("Loading chunk")) {
    return false;
  }

  // Let other errors fail the test
  return true;
});

// Custom configuration
Cypress.config("defaultCommandTimeout", 10000);
Cypress.config("requestTimeout", 10000);
Cypress.config("responseTimeout", 10000);

// Add custom viewport sizes
Cypress.Commands.add("setMobileViewport", () => {
  cy.viewport(375, 667); // iPhone SE
});

Cypress.Commands.add("setTabletViewport", () => {
  cy.viewport(768, 1024); // iPad
});

Cypress.Commands.add("setDesktopViewport", () => {
  cy.viewport(1280, 720); // Desktop
});

// Database helpers
Cypress.Commands.add("seedDatabase", () => {
  cy.task("seedDatabase");
});

Cypress.Commands.add("clearDatabase", () => {
  cy.task("clearDatabase");
});

// Authentication helpers - Updated for real NextAuth implementation
Cypress.Commands.add("loginAsResident", (userData = {}) => {
  const defaultUser = {
    id: "resident-123",
    name: "Dr. Test Resident",
    email: "resident@hospital.cl",
    role: "resident",
    rut: "12.345.678-9",
    isActive: true,
    area: "Cirugía General",
    ...userData,
  };

  // Set NextAuth session cookie (the actual cookie name used by NextAuth)
  cy.setCookie("authjs.session-token", "mock-session-token-resident", {
    domain: "localhost",
    httpOnly: false,
    secure: false,
    sameSite: "lax",
  });

  // Mock NextAuth session API
  cy.intercept("GET", "/api/auth/session", {
    statusCode: 200,
    body: {
      user: defaultUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  }).as("mockSession");

  // Mock user role API (used by the protected layout)
  cy.intercept("GET", "/api/user/role", {
    statusCode: 200,
    body: {
      role: "resident",
      isAdmin: false,
      area: defaultUser.area,
    },
  }).as("mockUserRole");

  // Mock other user-related APIs
  cy.intercept("GET", "/api/user/profile", {
    statusCode: 200,
    body: defaultUser,
  }).as("mockUserProfile");
});

Cypress.Commands.add("loginAsTeacher", (userData = {}) => {
  const defaultUser = {
    id: "teacher-123",
    name: "Dr. Test Teacher",
    email: "teacher@hospital.cl",
    role: "teacher",
    rut: "98.765.432-1",
    isActive: true,
    area: "Cirugía General",
    ...userData,
  };

  // Set NextAuth session cookie
  cy.setCookie("authjs.session-token", "mock-session-token-teacher", {
    domain: "localhost",
    httpOnly: false,
    secure: false,
    sameSite: "lax",
  });

  // Mock NextAuth session API
  cy.intercept("GET", "/api/auth/session", {
    statusCode: 200,
    body: {
      user: defaultUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  }).as("mockSession");

  // Mock user role API
  cy.intercept("GET", "/api/user/role", {
    statusCode: 200,
    body: {
      role: "teacher",
      isAdmin: false,
      area: defaultUser.area,
    },
  }).as("mockUserRole");

  // Mock user profile API
  cy.intercept("GET", "/api/user/profile", {
    statusCode: 200,
    body: defaultUser,
  }).as("mockUserProfile");
});

Cypress.Commands.add("loginAsAdmin", (userData = {}) => {
  const defaultUser = {
    id: "admin-123",
    name: "Dr. Test Admin",
    email: "admin@hospital.cl",
    role: "admin",
    rut: "11.111.111-1",
    isActive: true,
    area: "Administración",
    ...userData,
  };

  // Set NextAuth session cookie
  cy.setCookie("authjs.session-token", "mock-session-token-admin", {
    domain: "localhost",
    httpOnly: false,
    secure: false,
    sameSite: "lax",
  });

  // Mock NextAuth session API
  cy.intercept("GET", "/api/auth/session", {
    statusCode: 200,
    body: {
      user: defaultUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  }).as("mockSession");

  // Mock user role API
  cy.intercept("GET", "/api/user/role", {
    statusCode: 200,
    body: {
      role: "admin",
      isAdmin: true,
      area: defaultUser.area,
    },
  }).as("mockUserRole");

  // Mock user profile API
  cy.intercept("GET", "/api/user/profile", {
    statusCode: 200,
    body: defaultUser,
  }).as("mockUserProfile");
});

Cypress.Commands.add("logout", () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

// Form helpers
Cypress.Commands.add("fillForm", (formData) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-testid="${field}-input"], [name="${field}"]`)
      .clear()
      .type(value as string);
  });
});

Cypress.Commands.add("submitForm", (formSelector = "form") => {
  cy.get(formSelector).submit();
});

// Wait helpers
Cypress.Commands.add("waitForPageLoad", () => {
  cy.get('[data-testid="page-loader"]', { timeout: 30000 }).should("not.exist");
});

Cypress.Commands.add("waitForApiCall", (alias) => {
  cy.wait(alias, { timeout: 15000 });
});

// Navigation helpers
Cypress.Commands.add("navigateTo", (path) => {
  cy.visit(path);
  cy.waitForPageLoad();
});

// Assertion helpers
Cypress.Commands.add("shouldBeVisible", (selector) => {
  cy.get(selector).should("be.visible");
});

Cypress.Commands.add("shouldContainText", (selector, text) => {
  cy.get(selector).should("contain.text", text);
});

Cypress.Commands.add("shouldHaveValue", (selector, value) => {
  cy.get(selector).should("have.value", value);
});

// File upload helper
Cypress.Commands.add("uploadFile", (selector, fileName) => {
  cy.get(selector).selectFile(`cypress/fixtures/${fileName}`);
});

// Screenshot helpers
Cypress.Commands.add("takeScreenshot", (name) => {
  cy.screenshot(name, { capture: "viewport" });
});

// Local storage helpers
Cypress.Commands.add("setLocalStorage", (key, value) => {
  cy.window().then((win) => {
    win.localStorage.setItem(key, JSON.stringify(value));
  });
});

// API intercept helpers
Cypress.Commands.add("interceptApi", (method, url, alias) => {
  cy.intercept(method, url).as(alias);
});

Cypress.Commands.add("mockApiResponse", (method, url, response, alias) => {
  cy.intercept(method as any, url, response).as(alias);
});

// Error handling
Cypress.Commands.add("handleError", (callback) => {
  cy.on("fail", (err) => {
    callback(err);
    throw err;
  });
});

// Console log helper - using built-in cy.log instead

// Test data creation helpers
Cypress.Commands.add("createMockRecord", () => {
  return cy.wrap("mock-record-id-123");
});

Cypress.Commands.add("createMockCompletedRecord", () => {
  return cy.wrap("mock-completed-record-id-456");
});

// Mobile viewport helper
Cypress.Commands.add("setMobileViewport", () => {
  cy.viewport(375, 667); // iPhone SE dimensions
});

// Form filling helper
Cypress.Commands.add("fillForm", (formData) => {
  Object.keys(formData).forEach((key) => {
    cy.get(
      `[data-testid="${key}-input"], [data-testid="${key}-select"], [data-testid="${key}-textarea"]`
    ).type(formData[key]);
  });
});
