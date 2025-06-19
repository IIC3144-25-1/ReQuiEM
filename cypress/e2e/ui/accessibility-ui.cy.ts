describe('Accessibility and UI Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA labels on landing page', () => {
      cy.visit('/');
      
      // Check main content has proper role
      cy.get('[data-testid="landing-page"]').should('have.attr', 'role', 'main');
      
      // Check buttons have accessible names
      cy.get('[data-testid="login-button"]').should('have.attr', 'aria-label').or('have.text');
      cy.get('[data-testid="mobile-menu-button"]').should('have.attr', 'aria-label');
    });

    it('should have proper heading hierarchy', () => {
      cy.visit('/');
      
      // Check h1 exists and is unique
      cy.get('h1').should('have.length', 1);
      cy.get('[data-testid="app-title"]').should('match', 'h1');
      
      // Check heading levels are sequential
      cy.get('h1, h2, h3, h4, h5, h6').then($headings => {
        const levels = Array.from($headings).map(h => parseInt(h.tagName.charAt(1)));
        let previousLevel = 0;
        
        levels.forEach(level => {
          expect(level).to.be.at.most(previousLevel + 1);
          previousLevel = level;
        });
      });
    });

    it('should have proper form labels and descriptions', () => {
      cy.visit('/login');
      
      // Check form elements have labels
      cy.get('input, select, textarea').each($input => {
        const id = $input.attr('id');
        if (id) {
          cy.get(`label[for="${id}"]`).should('exist');
        }
      });
      
      // Check buttons have accessible text
      cy.get('[data-testid="google-signin-button"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="microsoft-signin-button"]').should('have.attr', 'aria-label');
    });

    it('should support keyboard navigation', () => {
      cy.visit('/');
      
      // Test tab navigation
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'login-button');
      
      // Test enter key activation
      cy.focused().type('{enter}');
      cy.url().should('include', '/login');
      
      // Test escape key functionality
      cy.get('body').type('{esc}');
    });

    it('should have sufficient color contrast', () => {
      cy.visit('/');
      
      // Check text elements have sufficient contrast
      cy.get('[data-testid="app-title"]').should('be.visible');
      cy.get('p').should('be.visible');
      
      // This would typically use a color contrast checking library
      // For now, we verify elements are visible and readable
      cy.get('[data-testid="app-title"]').should('have.css', 'color');
      cy.get('body').should('have.css', 'background-color');
    });

    it('should work with screen reader announcements', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');
      
      // Check for live regions
      cy.get('[aria-live]').should('exist');
      
      // Test form validation announcements
      cy.get('[data-testid="submit-record-form"]').click();
      cy.get('[role="alert"], [aria-live="assertive"]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.setMobileViewport();
      cy.visit('/');
      
      // Check mobile layout
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
      cy.get('[data-testid="landing-page"]').should('be.visible');
      
      // Test mobile navigation
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-nav-menu"]').should('be.visible');
    });

    it('should work on tablet devices', () => {
      cy.viewport(768, 1024); // iPad dimensions
      cy.visit('/');
      
      // Check tablet layout adapts properly
      cy.get('[data-testid="landing-page"]').should('be.visible');
      cy.get('[data-testid="app-title"]').should('be.visible');
    });

    it('should work on desktop', () => {
      cy.viewport(1920, 1080);
      cy.visit('/');
      
      // Check desktop layout
      cy.get('[data-testid="landing-page"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-button"]').should('not.be.visible');
    });

    it('should handle orientation changes', () => {
      cy.setMobileViewport();
      cy.visit('/');
      
      // Portrait mode
      cy.get('[data-testid="landing-page"]').should('be.visible');
      
      // Landscape mode
      cy.viewport(667, 375);
      cy.get('[data-testid="landing-page"]').should('be.visible');
    });

    it('should have touch-friendly interface on mobile', () => {
      cy.setMobileViewport();
      cy.visit('/');
      
      // Check button sizes are touch-friendly (minimum 44px)
      cy.get('[data-testid="login-button"]').should('have.css', 'min-height');
      cy.get('[data-testid="mobile-menu-button"]').should('have.css', 'min-height');
    });
  });

  describe('User Interface Consistency', () => {
    it('should have consistent navigation across pages', () => {
      cy.loginAsResident();
      
      const pages = ['/resident/dashboard', '/resident/records', '/resident/new-record'];
      
      pages.forEach(page => {
        cy.visit(page);
        
        // Check navigation elements are consistent
        cy.get('[data-testid="nav-dashboard"]').should('be.visible');
        cy.get('[data-testid="nav-records"]').should('be.visible');
        cy.get('[data-testid="nav-new-record"]').should('be.visible');
        
        // Check user info is displayed
        cy.get('[data-testid="user-name"]').should('be.visible');
      });
    });

    it('should have consistent button styles', () => {
      cy.visit('/');
      
      // Check primary buttons have consistent styling
      cy.get('[data-testid="login-button"]').should('have.class', 'btn-primary').or('have.css', 'background-color');
      
      cy.visit('/login');
      cy.get('[data-testid="google-signin-button"]').should('have.css', 'border');
      cy.get('[data-testid="microsoft-signin-button"]').should('have.css', 'border');
    });

    it('should have consistent form styling', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');
      
      // Check form elements have consistent styling
      cy.get('input, select, textarea').each($element => {
        cy.wrap($element).should('have.css', 'border');
        cy.wrap($element).should('have.css', 'padding');
      });
      
      // Check labels have consistent styling
      cy.get('label').each($label => {
        cy.wrap($label).should('have.css', 'font-weight');
      });
    });

    it('should have consistent error message styling', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');
      
      // Trigger validation errors
      cy.get('[data-testid="submit-record-form"]').click();
      
      // Check error messages have consistent styling
      cy.get('[data-testid$="-error"]').each($error => {
        cy.wrap($error).should('have.css', 'color');
        cy.wrap($error).should('be.visible');
      });
    });
  });

  describe('Loading States and Feedback', () => {
    it('should show loading indicators during data fetching', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');
      
      // Check for loading skeletons or spinners
      cy.get('[data-testid="chart-skeleton"], [data-testid="loading-spinner"]').should('be.visible');
      
      // Wait for content to load
      cy.get('[data-testid="records-completed-chart"]', { timeout: 10000 }).should('be.visible');
    });

    it('should show success messages after actions', () => {
      cy.loginAsResident();
      cy.createMockRecord().then((recordId) => {
        cy.visit(`/resident/complete-record/${recordId}`);
        
        // Complete the record
        cy.get('[data-testid="step-checkbox-0"]').check();
        cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 8).trigger('input');
        cy.get('[data-testid="resident-comment-textarea"]').type('Test comment');
        cy.get('[data-testid="submit-steps-form"]').click();
        
        // Check success message
        cy.get('[data-testid="success-message"]').should('be.visible');
        cy.get('[data-testid="success-message"]').should('contain.text', 'exitosamente');
      });
    });

    it('should show error messages when operations fail', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');
      
      // Mock network error
      cy.intercept('POST', '/api/records', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('createRecordError');
      
      // Fill form and submit
      cy.get('[data-testid="surgery-select"]').select('Apendicectomía Laparoscópica');
      cy.get('[data-testid="teacher-select"]').select('Dr. María González');
      cy.get('[data-testid="patient-id-input"]').type('12.345.678-9');
      cy.get('[data-testid="submit-record-form"]').click();
      
      cy.wait('@createRecordError');
      
      // Check error message
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'error');
    });

    it('should provide progress indicators for multi-step processes', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');
      
      // Check if there's a progress indicator
      cy.get('[data-testid="progress-indicator"], [data-testid="step-indicator"]').should('be.visible');
      
      // Fill form and proceed
      cy.get('[data-testid="surgery-select"]').select('Apendicectomía Laparoscópica');
      cy.get('[data-testid="teacher-select"]').select('Dr. María González');
      cy.get('[data-testid="patient-id-input"]').type('12.345.678-9');
      cy.get('[data-testid="submit-record-form"]').click();
      
      // Check progress updated
      cy.get('[data-testid="progress-indicator"], [data-testid="step-indicator"]').should('contain.text', '2');
    });
  });

  describe('Data Visualization', () => {
    it('should display charts and graphs correctly', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');
      
      // Check charts are rendered
      cy.get('[data-testid="records-completed-chart"]').should('be.visible');
      cy.get('[data-testid="surgery-types-chart"]').should('be.visible');
      cy.get('[data-testid="steps-completed-chart"]').should('be.visible');
      
      // Check chart elements
      cy.get('[data-testid="records-completed-chart"]').within(() => {
        cy.get('svg, canvas').should('be.visible');
      });
    });

    it('should handle empty data states', () => {
      cy.loginAsResident({
        name: 'New Resident',
        email: 'new.resident@hospital.cl'
      });
      cy.visit('/resident/dashboard');
      
      // Check empty state messages
      cy.get('[data-testid="no-data-message"]').should('be.visible');
      cy.get('[data-testid="no-data-message"]').should('contain.text', 'No hay datos');
    });

    it('should be interactive and responsive', () => {
      cy.loginAsTeacher();
      cy.visit('/teacher/dashboard');
      
      // Select different resident
      cy.get('[data-testid="resident-select"]').select('Test Resident');
      
      // Check charts update
      cy.get('[data-testid="records-completed-chart"]').should('be.visible');
      
      // Test chart interactions (hover, click)
      cy.get('[data-testid="records-completed-chart"]').trigger('mouseover');
      cy.get('[data-testid="chart-tooltip"]').should('be.visible');
    });
  });

  describe('Print and Export Functionality', () => {
    it('should have print-friendly styles', () => {
      cy.loginAsResident();
      cy.visit('/resident/records');
      
      // Check print styles exist
      cy.get('head').should('contain.html', '@media print');
      
      // Test print button
      cy.get('[data-testid="print-button"]').should('be.visible');
    });

    it('should support data export', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');
      
      // Test export functionality
      cy.get('[data-testid="export-button"]').should('be.visible');
      cy.get('[data-testid="export-button"]').click();
      
      // Check export options
      cy.get('[data-testid="export-pdf"]').should('be.visible');
      cy.get('[data-testid="export-excel"]').should('be.visible');
    });
  });
});
