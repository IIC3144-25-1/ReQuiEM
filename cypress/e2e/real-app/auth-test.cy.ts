describe('Authentication Test - Verify Login Works', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should redirect unauthenticated users to login', () => {
    cy.visit('/resident/dashboard');
    cy.url().should('include', '/login');
    cy.get('[data-testid="signin-page"]').should('be.visible');
  });

  it('should mock resident authentication and access dashboard', () => {
    cy.loginAsResident();
    cy.visit('/resident/dashboard');
    
    // Should not redirect to login
    cy.url().should('include', '/resident/dashboard');
    
    // Should show some content (even if it's loading)
    cy.get('body').should('be.visible');
  });

  it('should mock teacher authentication and access dashboard', () => {
    cy.loginAsTeacher();
    cy.visit('/teacher/dashboard');
    
    // Should not redirect to login
    cy.url().should('include', '/teacher/dashboard');
    
    // Should show some content
    cy.get('body').should('be.visible');
  });

  it('should mock admin authentication and access admin pages', () => {
    cy.loginAsAdmin();
    cy.visit('/admin/resident');
    
    // Should not redirect to login
    cy.url().should('include', '/admin/resident');
    
    // Should show some content
    cy.get('body').should('be.visible');
  });

  it('should display login page correctly', () => {
    cy.visit('/login');
    
    cy.get('[data-testid="signin-page"]').should('be.visible');
    cy.get('[data-testid="google-signin-button"]').should('be.visible');
    cy.get('[data-testid="microsoft-signin-button"]').should('be.visible');
    
    cy.contains('Bienvenido').should('be.visible');
    cy.contains('Iniciar sesión con Google').should('be.visible');
    cy.contains('Iniciar sesión con Microsoft').should('be.visible');
  });
});
