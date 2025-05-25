/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// Declarar tipos personalizados para TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      mockAuthenticatedUser(): Chainable<void>;
      mockSuccessfulLogin(): Chainable<void>;
      mockSuccessfulLoginWithCallback(callbackUrl: string): Chainable<void>;
      mockLogout(): Chainable<void>;
      mockExpiredSession(): Chainable<void>;
    }
  }
}

// Comando para simular usuario autenticado
Cypress.Commands.add("mockAuthenticatedUser", () => {
  // Mockear la sesión de NextAuth
  cy.setCookie("next-auth.session-token", "mock-session-token");

  // Interceptar las llamadas a la API de sesión
  cy.intercept("GET", "/api/auth/session", {
    statusCode: 200,
    body: {
      user: {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        image: "https://via.placeholder.com/40",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  }).as("getSession");
});

// Comando para simular login exitoso
Cypress.Commands.add("mockSuccessfulLogin", () => {
  // Interceptar el signin y simular redirección exitosa
  cy.intercept("POST", "/api/auth/signin/google", {
    statusCode: 302,
    headers: {
      location: "/",
    },
  }).as("successfulSignIn");

  // Mockear sesión después del login
  cy.mockAuthenticatedUser();

  // Simular la redirección
  cy.get('button[type="submit"]').contains("Login with Google").click();
  cy.visit("/");
});

// Comando para simular login exitoso con callback URL
Cypress.Commands.add(
  "mockSuccessfulLoginWithCallback",
  (callbackUrl: string) => {
    cy.intercept("POST", "/api/auth/signin/google", {
      statusCode: 302,
      headers: {
        location: callbackUrl,
      },
    }).as("successfulSignInWithCallback");

    cy.mockAuthenticatedUser();

    cy.get('button[type="submit"]').contains("Login with Google").click();
    cy.visit(callbackUrl);
  }
);

// Comando para simular logout
Cypress.Commands.add("mockLogout", () => {
  cy.clearCookies();
  cy.clearLocalStorage();

  cy.intercept("POST", "/api/auth/signout", {
    statusCode: 200,
    body: { url: "/" },
  }).as("signOut");

  cy.intercept("GET", "/api/auth/session", {
    statusCode: 200,
    body: {},
  }).as("getSessionAfterLogout");
});

// Comando para simular sesión expirada
Cypress.Commands.add("mockExpiredSession", () => {
  cy.intercept("GET", "/api/auth/session", {
    statusCode: 401,
    body: { error: "Session expired" },
  }).as("expiredSession");
});

export {};
