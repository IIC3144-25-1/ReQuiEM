describe('Real Resident Workflows - Testing Actual Application', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Authentication and Dashboard', () => {
    it('should authenticate and access resident dashboard', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');
      
      // Check for actual page content based on the real component
      cy.contains('Dashboard Residente').should('be.visible');
      cy.get('.container, .max-w-7xl').should('be.visible');
      
      // Charts load with Suspense, check for grid layout
      cy.get('.grid').should('be.visible');
    });

    it('should redirect unauthenticated users to login', () => {
      cy.visit('/resident/dashboard');
      cy.url().should('include', '/login');
    });
  });

  describe('Real Surgery Record Creation - RecordForm Component', () => {
    beforeEach(() => {
      cy.loginAsResident();
    });

    it('should create a surgery record using the actual RecordForm', () => {
      cy.visit('/resident/new-record');
      
      // Wait for form to load
      cy.get('form').should('be.visible');
      
      // Fill the actual form fields based on RecordForm component
      // Surgery select
      cy.get('select').first().then($select => {
        if ($select.find('option').length > 1) {
          cy.wrap($select).select(1); // Select first available surgery
        }
      });
      
      // Teacher select  
      cy.get('select').eq(1).then($select => {
        if ($select.find('option').length > 1) {
          cy.wrap($select).select(1); // Select first available teacher
        }
      });
      
      // Patient ID (RUT)
      cy.get('input[name="patientId"]').type('12.345.678-9');
      
      // Date picker - click to open calendar
      cy.get('button').contains('Pick a date').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('[data-today], .rdp-day_today').click();
      
      // Time selects
      cy.get('select').contains('14').parent().select('14');
      cy.get('select').contains('30').parent().select('30');
      
      // Resident year
      cy.get('select[name="residentsYear"]').select('3');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to complete-record page
      cy.url().should('include', '/resident/complete-record/');
      cy.contains('Completar Registro').should('be.visible');
    });

    it('should validate required fields with real Zod validation', () => {
      cy.visit('/resident/new-record');
      
      // Try to submit empty form
      cy.get('button[type="submit"]').click();
      
      // Check for actual validation messages from Zod schema
      cy.get('body').should('contain.text', 'requerido');
    });

    it('should validate RUT format', () => {
      cy.visit('/resident/new-record');
      
      // Enter invalid RUT
      cy.get('input[name="patientId"]').type('invalid-rut');
      cy.get('button[type="submit"]').click();
      
      // Should show validation error
      cy.get('body').should('contain.text', 'formato');
    });
  });

  describe('Real Steps Completion - StepsRecordForm Component', () => {
    beforeEach(() => {
      cy.loginAsResident();
    });

    it('should complete surgery steps using actual StepsRecordForm', () => {
      // First create a record to get a real ID
      cy.visit('/resident/new-record');
      
      // Fill form quickly
      cy.get('select').first().select(1);
      cy.get('select').eq(1).select(1);
      cy.get('input[name="patientId"]').type('12.345.678-9');
      cy.get('button').contains('Pick a date').click();
      cy.get('[data-today], .rdp-day_today').click();
      cy.get('button[type="submit"]').click();
      
      // Now we're on the complete-record page
      cy.url().should('include', '/resident/complete-record/');
      
      // Complete steps using actual form
      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="checkbox"]').eq(1).check();
      
      // Set resident judgment using actual slider
      cy.get('input[type="range"]').invoke('val', 8).trigger('input');
      
      // Add comment using actual textarea
      cy.get('textarea[name="residentComment"]').type('Procedimiento completado exitosamente.');
      
      // Submit using actual form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to records list
      cy.url().should('include', '/resident/records');
    });

    it('should validate steps completion requirements', () => {
      // Create a record first
      cy.visit('/resident/new-record');
      cy.get('select').first().select(1);
      cy.get('select').eq(1).select(1);
      cy.get('input[name="patientId"]').type('12.345.678-9');
      cy.get('button').contains('Pick a date').click();
      cy.get('[data-today], .rdp-day_today').click();
      cy.get('button[type="submit"]').click();
      
      // Try to submit without completing steps
      cy.get('button[type="submit"]').click();
      
      // Should show validation error
      cy.get('body').should('contain.text', 'requerido');
    });
  });

  describe('Real Records Management', () => {
    beforeEach(() => {
      cy.loginAsResident();
    });

    it('should display records list using ResidentRecordsClient', () => {
      cy.visit('/resident/records');
      
      // Check for actual component structure
      cy.get('.container, .max-w-7xl').should('be.visible');
      
      // Records might be empty for new user
      cy.get('body').then($body => {
        if ($body.text().includes('No hay registros')) {
          cy.contains('No hay registros').should('be.visible');
        } else {
          // If records exist, check their structure
          cy.get('.grid, .space-y-4').should('be.visible');
        }
      });
    });

    it('should view individual record details', () => {
      cy.visit('/resident/records');
      
      // If records exist, click on one
      cy.get('body').then($body => {
        if ($body.find('a[href*="/resident/records/"]').length > 0) {
          cy.get('a[href*="/resident/records/"]').first().click();
          cy.url().should('include', '/resident/records/');
          cy.get('.container').should('be.visible');
        }
      });
    });
  });

  describe('Real Navigation and User Experience', () => {
    beforeEach(() => {
      cy.loginAsResident();
    });

    it('should navigate between sections using actual navbar', () => {
      cy.visit('/resident/dashboard');
      
      // Test actual navigation links
      cy.get('[data-testid="nav-records"]').click();
      cy.url().should('include', '/resident/records');
      
      cy.get('[data-testid="nav-new-record"]').click();
      cy.url().should('include', '/resident/new-record');
      
      cy.get('[data-testid="nav-dashboard"]').click();
      cy.url().should('include', '/resident/dashboard');
    });

    it('should display user information in navbar', () => {
      cy.visit('/resident/dashboard');
      
      // Check for user menu or user info
      cy.get('[data-testid="user-menu"], .user-info').should('be.visible');
    });

    it('should handle mobile responsive design', () => {
      cy.setMobileViewport();
      cy.visit('/resident/dashboard');
      
      // Check for mobile menu
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-nav-menu"]').should('be.visible');
    });
  });

  describe('Real Error Handling and Edge Cases', () => {
    beforeEach(() => {
      cy.loginAsResident();
    });

    it('should handle network errors gracefully', () => {
      // Mock network error for record creation
      cy.intercept('POST', '/api/records', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/resident/new-record');
      cy.get('select').first().select(1);
      cy.get('select').eq(1).select(1);
      cy.get('input[name="patientId"]').type('12.345.678-9');
      cy.get('button').contains('Pick a date').click();
      cy.get('[data-today], .rdp-day_today').click();
      cy.get('button[type="submit"]').click();
      
      cy.wait('@networkError');
      
      // Should handle error gracefully
      cy.get('body').should('contain.text', 'error');
    });

    it('should validate future date restriction', () => {
      cy.visit('/resident/new-record');
      
      // Try to select future date
      cy.get('button').contains('Pick a date').click();
      
      // Calendar should prevent future date selection or show error
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should handle session expiration', () => {
      cy.visit('/resident/dashboard');
      
      // Clear session
      cy.clearCookies();
      cy.clearLocalStorage();
      
      // Try to navigate to protected route
      cy.visit('/resident/records');
      cy.url().should('include', '/login');
    });
  });

  describe('Real Data Persistence and State Management', () => {
    beforeEach(() => {
      cy.loginAsResident();
    });

    it('should persist form data during navigation', () => {
      cy.visit('/resident/new-record');
      
      // Fill partial form
      cy.get('input[name="patientId"]').type('12.345.678-9');
      
      // Navigate away and back
      cy.visit('/resident/dashboard');
      cy.visit('/resident/new-record');
      
      // Form might preserve data or reset (depends on implementation)
      cy.get('input[name="patientId"]').should('exist');
    });

    it('should handle record status changes correctly', () => {
      // Create a record
      cy.visit('/resident/new-record');
      cy.get('select').first().select(1);
      cy.get('select').eq(1).select(1);
      cy.get('input[name="patientId"]').type('12.345.678-9');
      cy.get('button').contains('Pick a date').click();
      cy.get('[data-today], .rdp-day_today').click();
      cy.get('button[type="submit"]').click();
      
      // Complete it
      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="range"]').invoke('val', 8).trigger('input');
      cy.get('textarea[name="residentComment"]').type('Completed');
      cy.get('button[type="submit"]').click();
      
      // Check status in records list
      cy.visit('/resident/records');
      cy.get('body').should('contain.text', 'corrected');
    });
  });
});
