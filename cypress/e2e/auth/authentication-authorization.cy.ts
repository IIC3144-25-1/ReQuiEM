describe('Authentication & Authorization', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Landing Page & Login Flow', () => {
    it('should display landing page for unauthenticated users', () => {
      cy.visit('/');
      cy.get('[data-testid="landing-page"]').should('be.visible');
      cy.get('[data-testid="app-title"]').should('contain.text', 'ReQuiEM');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });

    it('should navigate to login page', () => {
      cy.visit('/');
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/login');
      cy.get('[data-testid="signin-page"]').should('be.visible');
    });

    it('should display OAuth login options', () => {
      cy.visit('/login');
      cy.get('[data-testid="google-signin-button"]').should('be.visible');
      cy.get('[data-testid="microsoft-signin-button"]').should('be.visible');
    });

    it('should have proper accessibility attributes', () => {
      cy.visit('/login');
      cy.get('[data-testid="signin-page"]').should('have.attr', 'role', 'main');
      cy.get('[data-testid="google-signin-button"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="microsoft-signin-button"]').should('have.attr', 'aria-label');
    });
  });

  describe('Role-Based Access Control', () => {
    describe('Admin Access', () => {
      beforeEach(() => {
        cy.loginAsAdmin();
      });

      it('should allow admin to access all admin routes', () => {
        // Test admin dashboard access
        cy.visit('/admin');
        cy.get('[data-testid="admin-dashboard"]').should('be.visible');

        // Test admin sections
        cy.visit('/admin/resident');
        cy.get('[data-testid="residents-table"]').should('be.visible');

        cy.visit('/admin/teacher');
        cy.get('[data-testid="teachers-table"]').should('be.visible');

        cy.visit('/admin/surgeries');
        cy.get('[data-testid="surgeries-table"]').should('be.visible');

        cy.visit('/admin/areas');
        cy.get('[data-testid="areas-table"]').should('be.visible');
      });

      it('should allow admin to access teacher and resident routes', () => {
        // Admin should be able to access teacher routes
        cy.visit('/teacher/dashboard');
        cy.get('[data-testid="teacher-dashboard"]').should('be.visible');

        // Admin should be able to access resident routes
        cy.visit('/resident/dashboard');
        cy.get('[data-testid="resident-dashboard"]').should('be.visible');
      });

      it('should display admin navigation menu', () => {
        cy.visit('/');
        cy.get('[data-testid="admin-menu"]').should('be.visible');
        cy.get('[data-testid="admin-menu"]').should('contain.text', 'Administrador');
      });
    });

    describe('Teacher Access', () => {
      beforeEach(() => {
        cy.loginAsTeacher();
      });

      it('should allow teacher to access teacher routes', () => {
        cy.visit('/teacher/dashboard');
        cy.get('[data-testid="teacher-dashboard"]').should('be.visible');

        cy.visit('/teacher/records');
        cy.get('[data-testid="records-list"]').should('be.visible');
      });

      it('should redirect teacher from admin routes', () => {
        cy.visit('/admin');
        cy.url().should('include', '/unauthorized');
        cy.get('[data-testid="unauthorized-message"]').should('be.visible');
      });

      it('should redirect teacher from resident routes', () => {
        cy.visit('/resident/dashboard');
        cy.url().should('include', '/unauthorized');
        cy.get('[data-testid="unauthorized-message"]').should('be.visible');
      });

      it('should display teacher navigation menu', () => {
        cy.visit('/');
        cy.get('[data-testid="teacher-menu"]').should('be.visible');
        cy.get('[data-testid="nav-dashboard"]').should('be.visible');
        cy.get('[data-testid="nav-records"]').should('be.visible');
      });
    });

    describe('Resident Access', () => {
      beforeEach(() => {
        cy.loginAsResident();
      });

      it('should allow resident to access resident routes', () => {
        cy.visit('/resident/dashboard');
        cy.get('[data-testid="resident-dashboard"]').should('be.visible');

        cy.visit('/resident/records');
        cy.get('[data-testid="records-list"]').should('be.visible');

        cy.visit('/resident/new-record');
        cy.get('[data-testid="record-form"]').should('be.visible');
      });

      it('should redirect resident from admin routes', () => {
        cy.visit('/admin');
        cy.url().should('include', '/unauthorized');
        cy.get('[data-testid="unauthorized-message"]').should('be.visible');
      });

      it('should redirect resident from teacher routes', () => {
        cy.visit('/teacher/dashboard');
        cy.url().should('include', '/unauthorized');
        cy.get('[data-testid="unauthorized-message"]').should('be.visible');
      });

      it('should display resident navigation menu', () => {
        cy.visit('/');
        cy.get('[data-testid="resident-menu"]').should('be.visible');
        cy.get('[data-testid="nav-dashboard"]').should('be.visible');
        cy.get('[data-testid="nav-records"]').should('be.visible');
        cy.get('[data-testid="nav-new-record"]').should('be.visible');
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      // Test protected admin routes
      cy.visit('/admin');
      cy.url().should('include', '/login');

      // Test protected teacher routes
      cy.visit('/teacher/dashboard');
      cy.url().should('include', '/login');

      // Test protected resident routes
      cy.visit('/resident/dashboard');
      cy.url().should('include', '/login');
    });

    it('should preserve callback URL after login', () => {
      // Try to access protected route
      cy.visit('/resident/dashboard');
      cy.url().should('include', '/login');
      cy.url().should('include', 'callbackUrl');

      // Mock login and verify redirect
      cy.loginAsResident();
      cy.url().should('include', '/resident/dashboard');
    });

    it('should handle deep links correctly', () => {
      // Test deep link to specific record
      const recordId = 'mock-record-id';
      cy.visit(`/resident/records/${recordId}`);
      cy.url().should('include', '/login');

      // Login and verify redirect to original URL
      cy.loginAsResident();
      cy.url().should('include', `/resident/records/${recordId}`);
    });
  });

  describe('Session Management', () => {
    it('should maintain session across page refreshes', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');
      cy.get('[data-testid="resident-dashboard"]').should('be.visible');

      // Refresh page
      cy.reload();
      cy.get('[data-testid="resident-dashboard"]').should('be.visible');
    });

    it('should handle session expiration', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');

      // Mock session expiration
      cy.clearLocalStorage();
      cy.clearCookies();

      // Try to navigate to another protected route
      cy.visit('/resident/records');
      cy.url().should('include', '/login');
    });

    it('should logout successfully', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');

      // Logout
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();

      // Should redirect to landing page
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.get('[data-testid="landing-page"]').should('be.visible');
    });
  });

  describe('User Information Display', () => {
    it('should display correct user information for admin', () => {
      cy.loginAsAdmin({
        name: 'Admin User',
        email: 'admin@hospital.cl'
      });
      cy.visit('/admin');

      cy.get('[data-testid="user-name"]').should('contain.text', 'Admin User');
      cy.get('[data-testid="user-role"]').should('contain.text', 'Administrador');
      cy.get('[data-testid="user-email"]').should('contain.text', 'admin@hospital.cl');
    });

    it('should display correct user information for teacher', () => {
      cy.loginAsTeacher({
        name: 'Dr. María González',
        email: 'maria.gonzalez@hospital.cl'
      });
      cy.visit('/teacher/dashboard');

      cy.get('[data-testid="user-name"]').should('contain.text', 'Dr. María González');
      cy.get('[data-testid="user-role"]').should('contain.text', 'Profesor');
    });

    it('should display correct user information for resident', () => {
      cy.loginAsResident({
        name: 'Dr. Juan Pérez',
        email: 'juan.perez@hospital.cl'
      });
      cy.visit('/resident/dashboard');

      cy.get('[data-testid="user-name"]').should('contain.text', 'Dr. Juan Pérez');
      cy.get('[data-testid="user-role"]').should('contain.text', 'Residente');
    });
  });

  describe('Error Handling', () => {
    it('should display unauthorized page for insufficient permissions', () => {
      cy.loginAsResident();
      cy.visit('/admin');

      cy.get('[data-testid="unauthorized-page"]').should('be.visible');
      cy.get('[data-testid="unauthorized-title"]').should('contain.text', 'Acceso Denegado');
      cy.get('[data-testid="unauthorized-message"]').should('contain.text', 'No tienes permisos');
    });

    it('should handle authentication errors gracefully', () => {
      // Mock authentication error
      cy.intercept('GET', '/api/auth/session', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('authError');

      cy.visit('/resident/dashboard');
      cy.wait('@authError');

      cy.url().should('include', '/login');
      cy.get('[data-testid="auth-error-message"]').should('be.visible');
    });

    it('should provide helpful error messages', () => {
      cy.visit('/login');
      
      // Mock OAuth error
      cy.intercept('POST', '/api/auth/signin/google', {
        statusCode: 400,
        body: { error: 'OAuth error' }
      }).as('oauthError');

      cy.get('[data-testid="google-signin-button"]').click();
      cy.wait('@oauthError');

      cy.get('[data-testid="login-error-message"]').should('be.visible');
      cy.get('[data-testid="login-error-message"]').should('contain.text', 'Error al iniciar sesión');
    });
  });
});
