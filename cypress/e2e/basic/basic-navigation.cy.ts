describe('Basic Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Landing Page', () => {
    it('should display the landing page', () => {
      cy.get('[data-testid="landing-page"]').should('be.visible');
      cy.get('[data-testid="app-title"]').should('contain.text', 'ReQuiEM');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });

    it('should navigate to login page when login button is clicked', () => {
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/login');
    });

    it('should be responsive on mobile', () => {
      cy.setMobileViewport();
      cy.get('[data-testid="landing-page"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
    });
  });

  describe('Login Page', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should display login page with OAuth buttons', () => {
      cy.get('[data-testid="signin-page"]').should('be.visible');
      cy.get('[data-testid="google-signin-button"]').should('be.visible');
      cy.get('[data-testid="microsoft-signin-button"]').should('be.visible');
    });

    it('should have proper accessibility attributes', () => {
      cy.get('[data-testid="signin-page"]').should('have.attr', 'role', 'main');
      cy.get('[data-testid="google-signin-button"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="microsoft-signin-button"]').should('have.attr', 'aria-label');
    });

    it('should show correct button text', () => {
      cy.get('[data-testid="google-signin-button"]')
        .should('contain.text', 'Google')
        .should('be.enabled');
      
      cy.get('[data-testid="microsoft-signin-button"]')
        .should('contain.text', 'Microsoft')
        .should('be.enabled');
    });
  });

  describe('Navigation', () => {
    it('should navigate between pages', () => {
      // Start at home
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Go to login
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/login');
      
      // Go back to home
      cy.visit('/');
      cy.get('[data-testid="landing-page"]').should('be.visible');
    });
  });
});
