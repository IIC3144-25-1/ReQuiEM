// cypress/support/e2e.test.ts
// Note: It's standard practice to place Cypress test spec files
// in the 'cypress/e2e/' directory (e.g., cypress/e2e/app_navigation.cy.ts).
// Placing test files directly in the 'support' folder is not typical.

describe('Application End-to-End Tests', () => {
    beforeEach(() => {
        // Visit the base URL of your application before each test.
        // Ensure your Cypress `baseUrl` is configured in `cypress.config.ts`
        // or provide the full URL here.
        cy.visit('/');
    });

    it('should display the logo and main navigation links on the homepage', () => {
        // Check for the logo text. This assumes "ReQuiEM Test" is visible text.
        // If it's an alt text for an image, you might need a different selector,
        // e.g., cy.get('img[alt="ReQuiEM Test"]').should('be.visible');
        cy.contains('ReQuiEM Test').should('be.visible');

        // Check for a main navigation link, e.g., "Dashboard"
        cy.contains('Dashboard').should('be.visible');

        // Check for another main navigation link, e.g., "Administrador"
        cy.contains('Administrador').should('be.visible');
    });

    it('should navigate to the login page when "Iniciar Sesión" is clicked', () => {
        // Assuming there's a link or button with the text "Iniciar Sesión"
        // that navigates to the login page.
        cy.contains('Iniciar Sesión').click();

        // Verify that the URL has changed to include the login path (e.g., '/login')
        // Adjust '/login' if your login path is different.
        cy.url().should('include', '/login');

        // Optionally, you can check for an element specific to the login page
        // For example, an email input field:
        // cy.get('input[name="email"]').should('be.visible');
        // Or a heading on the login page:
        // cy.contains('h1', 'Login').should('be.visible');
    });

    // Example for interacting with a dropdown menu (like "Administrador")
    it('should open the "Administrador" submenu and show its items', () => {
        // Click on the "Administrador" link/button to open the submenu
        cy.contains('Administrador').click();

        // Check if a submenu item is now visible
        // This assumes "Residentes" is a link or text within the opened submenu.
        cy.contains('Residentes').should('be.visible');

        // You can also check for the description or URL
        // cy.contains('Maneja los residentes').should('be.visible');
        // cy.get('a[href="/admin/resident"]').should('be.visible');
    });
});

// To make this file a module to avoid isolatedModules error if it's empty or only has comments.
export {};