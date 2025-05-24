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
      openMobileMenu(): Chainable<void>;
      openDesktopDropdown(dropdownName: string): Chainable<void>;
      checkNavbarLogo(): Chainable<void>;
    }
  }
}

// Comando para abrir el menú móvil
Cypress.Commands.add('openMobileMenu', () => {
  cy.get('button[aria-label="Open menu"]').click();
  cy.get('[role="dialog"]').should("be.visible");
});

// Comando para abrir dropdown en desktop
Cypress.Commands.add('openDesktopDropdown', (dropdownName: string) => {
  cy.get("nav").contains("button", dropdownName).click();
  cy.get('[role="dialog"]').should("be.visible");
});

// Comando para verificar el logo
Cypress.Commands.add('checkNavbarLogo', () => {
  cy.contains("a", "ReQuiEM")
    .should("be.visible")
    .and("have.attr", "href", "/");
});

export {};