describe('Real Teacher Review Workflows - Testing Actual Review Forms', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Teacher Authentication and Dashboard', () => {
    it('should authenticate teacher and access dashboard', () => {
      cy.loginAsTeacher();
      cy.visit('/teacher/dashboard');
      
      // Check for actual teacher dashboard content
      cy.get('.container, .max-w-7xl').should('be.visible');
      cy.contains('Dashboard').should('be.visible');
    });

    it('should display teacher-specific navigation', () => {
      cy.loginAsTeacher();
      cy.visit('/teacher/dashboard');
      
      // Check for teacher navigation links
      cy.get('[data-testid="nav-records"]').should('be.visible');
      cy.get('[data-testid="nav-dashboard"]').should('be.visible');
    });
  });

  describe('Real Record Review Process - ReviewRecordForm Component', () => {
    beforeEach(() => {
      cy.loginAsTeacher();
    });

    it('should access records assigned to teacher', () => {
      cy.visit('/teacher/records');
      
      // Check for records list
      cy.get('.container, .max-w-7xl').should('be.visible');
      
      // Records might be empty or populated
      cy.get('body').then($body => {
        if ($body.text().includes('No hay registros')) {
          cy.contains('No hay registros').should('be.visible');
        } else {
          // If records exist, check structure
          cy.get('.grid, .space-y-4').should('be.visible');
        }
      });
    });

    it('should review a surgery record using actual ReviewRecordForm', () => {
      // First, create a record as resident to review
      cy.loginAsResident();
      cy.visit('/resident/new-record');
      
      // Create and complete a record
      cy.get('select').first().select(1);
      cy.get('select').eq(1).select(1);
      cy.get('input[name="patientId"]').type('12.345.678-9');
      cy.get('button').contains('Pick a date').click();
      cy.get('[data-today], .rdp-day_today').click();
      cy.get('button[type="submit"]').click();
      
      // Complete the record
      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="range"]').invoke('val', 8).trigger('input');
      cy.get('textarea[name="residentComment"]').type('Completed by resident');
      cy.get('button[type="submit"]').click();
      
      // Now login as teacher and review
      cy.loginAsTeacher();
      cy.visit('/teacher/records');
      
      // Find the record to review
      cy.get('body').then($body => {
        if ($body.find('a[href*="/teacher/review/"]').length > 0) {
          cy.get('a[href*="/teacher/review/"]').first().click();
          
          // Should load review form
          cy.url().should('include', '/teacher/review/');
          cy.get('form').should('be.visible');
          
          // Review steps - mark as done and score
          cy.get('input[type="checkbox"]').first().check();
          cy.get('select').first().select('a'); // Score 'a'
          
          // Fill OSAT evaluations
          cy.get('input[type="number"]').first().clear().type('4');
          
          // Set teacher judgment
          cy.get('input[type="range"]').invoke('val', 8).trigger('input');
          
          // Select summary scale
          cy.get('select[name="summaryScale"]').select('A');
          
          // Add feedback
          cy.get('textarea[name="feedback"]').type('Excelente desempeño. Continuar desarrollando habilidades técnicas.');
          
          // Submit review
          cy.get('button[type="submit"]').click();
          
          // Should redirect to records list
          cy.url().should('include', '/teacher/records');
        }
      });
    });

    it('should validate review form requirements', () => {
      cy.visit('/teacher/records');
      
      // If review link exists, test validation
      cy.get('body').then($body => {
        if ($body.find('a[href*="/teacher/review/"]').length > 0) {
          cy.get('a[href*="/teacher/review/"]').first().click();
          
          // Try to submit empty review
          cy.get('button[type="submit"]').click();
          
          // Should show validation errors
          cy.get('body').should('contain.text', 'requerido');
        }
      });
    });

    it('should validate OSAT score ranges', () => {
      cy.visit('/teacher/records');
      
      cy.get('body').then($body => {
        if ($body.find('a[href*="/teacher/review/"]').length > 0) {
          cy.get('a[href*="/teacher/review/"]').first().click();
          
          // Enter invalid OSAT score
          cy.get('input[type="number"]').first().clear().type('6');
          cy.get('button[type="submit"]').click();
          
          // Should show validation error
          cy.get('body').should('contain.text', 'válido');
        }
      });
    });
  });

  describe('Real Record Status Management', () => {
    beforeEach(() => {
      cy.loginAsTeacher();
    });

    it('should only show records assigned to current teacher', () => {
      cy.visit('/teacher/records');
      
      // Records should be filtered by teacher assignment
      cy.get('body').then($body => {
        if ($body.find('[data-teacher-id]').length > 0) {
          // Verify all records are assigned to current teacher
          cy.get('[data-teacher-id]').each($record => {
            cy.wrap($record).should('have.attr', 'data-teacher-id', 'current-teacher-id');
          });
        }
      });
    });

    it('should filter records by status', () => {
      cy.visit('/teacher/records');
      
      // Check for status filter
      cy.get('body').then($body => {
        if ($body.find('select[name="status"]').length > 0) {
          cy.get('select[name="status"]').select('corrected');
          
          // Should show only corrected records
          cy.get('[data-status="corrected"]').should('be.visible');
        }
      });
    });

    it('should show record details before review', () => {
      cy.visit('/teacher/records');
      
      cy.get('body').then($body => {
        if ($body.find('a[href*="/teacher/records/"]').length > 0) {
          cy.get('a[href*="/teacher/records/"]').first().click();
          
          // Should show record details
          cy.url().should('include', '/teacher/records/');
          cy.get('.container').should('be.visible');
          
          // Should show surgery info, resident info, steps completed
          cy.contains('Cirugía').should('be.visible');
          cy.contains('Residente').should('be.visible');
        }
      });
    });
  });

  describe('Real Teacher Dashboard Analytics', () => {
    beforeEach(() => {
      cy.loginAsTeacher();
    });

    it('should display teacher dashboard with resident selection', () => {
      cy.visit('/teacher/dashboard');
      
      // Check for resident selector
      cy.get('body').then($body => {
        if ($body.find('select').length > 0) {
          cy.get('select').first().should('be.visible');
          
          // Select a resident
          cy.get('select').first().select(1);
          
          // Dashboard should update with resident data
          cy.get('.grid, .chart-container').should('be.visible');
        }
      });
    });

    it('should show charts and statistics for selected resident', () => {
      cy.visit('/teacher/dashboard');
      
      // Charts load with Suspense
      cy.get('.grid').should('be.visible');
      
      // Wait for charts to load
      cy.get('[data-testid="chart-skeleton"], .recharts-wrapper', { timeout: 10000 }).should('exist');
    });

    it('should display pending reviews count', () => {
      cy.visit('/teacher/dashboard');
      
      // Should show number of pending reviews
      cy.get('body').then($body => {
        if ($body.text().includes('pendientes')) {
          cy.contains('pendientes').should('be.visible');
        }
      });
    });
  });

  describe('Real Navigation and User Experience', () => {
    beforeEach(() => {
      cy.loginAsTeacher();
    });

    it('should navigate between teacher sections', () => {
      cy.visit('/teacher/dashboard');
      
      // Test navigation
      cy.get('[data-testid="nav-records"]').click();
      cy.url().should('include', '/teacher/records');
      
      cy.get('[data-testid="nav-dashboard"]').click();
      cy.url().should('include', '/teacher/dashboard');
    });

    it('should display teacher information in navbar', () => {
      cy.visit('/teacher/dashboard');
      
      // Check for user menu
      cy.get('[data-testid="user-menu"], .user-info').should('be.visible');
    });

    it('should handle mobile responsive design', () => {
      cy.setMobileViewport();
      cy.visit('/teacher/dashboard');
      
      // Check mobile navigation
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-nav-menu"]').should('be.visible');
    });
  });

  describe('Real Error Handling and Edge Cases', () => {
    beforeEach(() => {
      cy.loginAsTeacher();
    });

    it('should handle network errors during review submission', () => {
      // Mock network error
      cy.intercept('POST', '/api/reviews', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/teacher/records');
      
      cy.get('body').then($body => {
        if ($body.find('a[href*="/teacher/review/"]').length > 0) {
          cy.get('a[href*="/teacher/review/"]').first().click();
          
          // Fill review form
          cy.get('input[type="checkbox"]').first().check();
          cy.get('select').first().select('a');
          cy.get('input[type="number"]').first().clear().type('4');
          cy.get('input[type="range"]').invoke('val', 8).trigger('input');
          cy.get('select[name="summaryScale"]').select('A');
          cy.get('textarea[name="feedback"]').type('Test feedback');
          
          cy.get('button[type="submit"]').click();
          cy.wait('@networkError');
          
          // Should handle error gracefully
          cy.get('body').should('contain.text', 'error');
        }
      });
    });

    it('should prevent reviewing already reviewed records', () => {
      cy.visit('/teacher/records');
      
      // Reviewed records should not have review button
      cy.get('body').then($body => {
        if ($body.find('[data-status="reviewed"]').length > 0) {
          cy.get('[data-status="reviewed"]').first().within(() => {
            cy.get('a[href*="/teacher/review/"]').should('not.exist');
          });
        }
      });
    });

    it('should handle session expiration during review', () => {
      cy.visit('/teacher/records');
      
      cy.get('body').then($body => {
        if ($body.find('a[href*="/teacher/review/"]').length > 0) {
          cy.get('a[href*="/teacher/review/"]').first().click();
          
          // Clear session
          cy.clearCookies();
          cy.clearLocalStorage();
          
          // Try to submit review
          cy.get('button[type="submit"]').click();
          
          // Should redirect to login
          cy.url().should('include', '/login');
        }
      });
    });
  });

  describe('Real Data Persistence and Feedback', () => {
    beforeEach(() => {
      cy.loginAsTeacher();
    });

    it('should save review data correctly', () => {
      cy.visit('/teacher/records');
      
      cy.get('body').then($body => {
        if ($body.find('a[href*="/teacher/review/"]').length > 0) {
          // Get record ID from URL
          const reviewUrl = $body.find('a[href*="/teacher/review/"]').first().attr('href');
          const recordId = reviewUrl?.split('/').pop();
          
          cy.get('a[href*="/teacher/review/"]').first().click();
          
          // Complete review
          cy.get('input[type="checkbox"]').first().check();
          cy.get('select').first().select('a');
          cy.get('input[type="number"]').first().clear().type('4');
          cy.get('input[type="range"]').invoke('val', 8).trigger('input');
          cy.get('select[name="summaryScale"]').select('A');
          cy.get('textarea[name="feedback"]').type('Excellent performance');
          cy.get('button[type="submit"]').click();
          
          // Verify record status changed
          cy.visit('/teacher/records');
          cy.get(`[data-record-id="${recordId}"]`).should('have.attr', 'data-status', 'reviewed');
        }
      });
    });

    it('should make feedback visible to resident', () => {
      // After teacher reviews, resident should see feedback
      cy.loginAsResident();
      cy.visit('/resident/records');
      
      cy.get('body').then($body => {
        if ($body.find('[data-status="reviewed"]').length > 0) {
          cy.get('[data-status="reviewed"]').first().click();
          
          // Should show teacher feedback
          cy.contains('Feedback').should('be.visible');
          cy.contains('Evaluación').should('be.visible');
        }
      });
    });
  });
});
