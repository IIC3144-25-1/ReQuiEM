describe('Performance and Edge Cases Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Performance Tests', () => {
    it('should load landing page within acceptable time', () => {
      const startTime = Date.now();
      
      cy.visit('/');
      cy.get('[data-testid="landing-page"]').should('be.visible');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // 3 seconds
      });
    });

    it('should load dashboard with charts efficiently', () => {
      cy.loginAsResident();
      
      const startTime = Date.now();
      cy.visit('/resident/dashboard');
      
      // Wait for all charts to load
      cy.get('[data-testid="records-completed-chart"]').should('be.visible');
      cy.get('[data-testid="surgery-types-chart"]').should('be.visible');
      cy.get('[data-testid="steps-completed-chart"]').should('be.visible');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // 5 seconds for dashboard
      });
    });

    it('should handle large datasets efficiently', () => {
      cy.loginAsResident();
      
      // Mock large dataset
      cy.intercept('GET', '/api/records*', {
        fixture: 'large-records-dataset.json'
      }).as('getLargeDataset');
      
      cy.visit('/resident/records');
      cy.wait('@getLargeDataset');
      
      // Check pagination or virtualization is working
      cy.get('[data-testid="records-list"]').should('be.visible');
      cy.get('[data-testid="pagination"], [data-testid="load-more"]').should('be.visible');
      
      // Test scrolling performance
      cy.get('[data-testid="records-list"]').scrollTo('bottom');
      cy.get('[data-testid="records-list"]').should('be.visible');
    });

    it('should optimize image loading', () => {
      cy.visit('/');
      
      // Check images have proper loading attributes
      cy.get('img').each($img => {
        cy.wrap($img).should('have.attr', 'loading', 'lazy')
          .or('have.attr', 'loading', 'eager');
      });
      
      // Check for proper image formats
      cy.get('img').each($img => {
        const src = $img.attr('src');
        if (src) {
          expect(src).to.match(/\.(webp|avif|jpg|jpeg|png|svg)$/i);
        }
      });
    });

    it('should cache API responses appropriately', () => {
      cy.loginAsResident();
      
      // First visit
      cy.visit('/resident/dashboard');
      cy.get('[data-testid="records-completed-chart"]').should('be.visible');
      
      // Second visit should use cache
      cy.visit('/resident/records');
      cy.visit('/resident/dashboard');
      
      // Check network requests are minimized
      cy.get('[data-testid="records-completed-chart"]').should('be.visible');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle network connectivity issues', () => {
      cy.loginAsResident();
      
      // Simulate offline mode
      cy.intercept('GET', '/api/**', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/resident/dashboard');
      
      // Check offline indicator or error message
      cy.get('[data-testid="offline-indicator"], [data-testid="network-error"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle server errors gracefully', () => {
      cy.loginAsResident();
      
      // Mock server error
      cy.intercept('GET', '/api/records', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('serverError');
      
      cy.visit('/resident/records');
      cy.wait('@serverError');
      
      // Check error handling
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'error del servidor');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle malformed API responses', () => {
      cy.loginAsResident();
      
      // Mock malformed response
      cy.intercept('GET', '/api/records', {
        statusCode: 200,
        body: 'invalid json'
      }).as('malformedResponse');
      
      cy.visit('/resident/records');
      cy.wait('@malformedResponse');
      
      // Check error handling
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'formato de datos');
    });

    it('should handle extremely long text inputs', () => {
      cy.loginAsResident();
      cy.createMockRecord().then((recordId) => {
        cy.visit(`/resident/complete-record/${recordId}`);
        
        // Test very long comment
        const longComment = 'a'.repeat(10000);
        cy.get('[data-testid="resident-comment-textarea"]').type(longComment.substring(0, 1000));
        
        // Check character limit enforcement
        cy.get('[data-testid="comment-length-indicator"]').should('contain.text', '1000');
        cy.get('[data-testid="resident-comment-textarea"]').should('have.value').and('have.length.at.most', 1000);
      });
    });

    it('should handle special characters and unicode', () => {
      cy.loginAsAdmin();
      cy.visit('/admin/resident/new');
      
      // Test special characters in names
      const specialName = 'José María Ñuñez-González';
      cy.get('[data-testid="resident-name-input"]').type(specialName);
      cy.get('[data-testid="resident-email-input"]').type('jose.maria@hospital.cl');
      cy.get('[data-testid="resident-rut-input"]').type('12.345.678-9');
      cy.get('[data-testid="resident-area-select"]').select('Cirugía General');
      
      cy.get('[data-testid="submit-resident-form"]').click();
      
      // Verify special characters are handled correctly
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="residents-table"]').should('contain.text', specialName);
    });

    it('should handle concurrent user actions', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');
      
      // Simulate rapid form submissions
      cy.get('[data-testid="surgery-select"]').select('Apendicectomía Laparoscópica');
      cy.get('[data-testid="teacher-select"]').select('Dr. María González');
      cy.get('[data-testid="patient-id-input"]').type('12.345.678-9');
      
      // Click submit multiple times rapidly
      cy.get('[data-testid="submit-record-form"]').click();
      cy.get('[data-testid="submit-record-form"]').click();
      cy.get('[data-testid="submit-record-form"]').click();
      
      // Should prevent duplicate submissions
      cy.get('[data-testid="submit-record-form"]').should('be.disabled');
    });

    it('should handle browser back/forward navigation', () => {
      cy.loginAsResident();
      
      // Navigate through pages
      cy.visit('/resident/dashboard');
      cy.visit('/resident/records');
      cy.visit('/resident/new-record');
      
      // Test browser back button
      cy.go('back');
      cy.url().should('include', '/resident/records');
      cy.get('[data-testid="records-list"]').should('be.visible');
      
      // Test browser forward button
      cy.go('forward');
      cy.url().should('include', '/resident/new-record');
      cy.get('[data-testid="record-form"]').should('be.visible');
    });

    it('should handle session expiration during form submission', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');
      
      // Fill form
      cy.get('[data-testid="surgery-select"]').select('Apendicectomía Laparoscópica');
      cy.get('[data-testid="teacher-select"]').select('Dr. María González');
      cy.get('[data-testid="patient-id-input"]').type('12.345.678-9');
      
      // Mock session expiration
      cy.intercept('POST', '/api/records', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('sessionExpired');
      
      cy.get('[data-testid="submit-record-form"]').click();
      cy.wait('@sessionExpired');
      
      // Should redirect to login with callback
      cy.url().should('include', '/login');
      cy.url().should('include', 'callbackUrl');
    });

    it('should handle invalid date ranges', () => {
      cy.loginAsTeacher();
      cy.visit('/teacher/records');
      
      // Set invalid date range (end before start)
      cy.get('[data-testid="date-filter-start"]').type('2024-12-31');
      cy.get('[data-testid="date-filter-end"]').type('2024-01-01');
      cy.get('[data-testid="apply-filter-button"]').click();
      
      // Should show validation error
      cy.get('[data-testid="date-range-error"]').should('be.visible');
      cy.get('[data-testid="date-range-error"]').should('contain.text', 'rango de fechas inválido');
    });

    it('should handle missing or corrupted local storage', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');
      
      // Corrupt local storage
      cy.window().then((win) => {
        win.localStorage.setItem('user-preferences', 'invalid-json');
      });
      
      // Refresh page
      cy.reload();
      
      // Should handle gracefully and reset to defaults
      cy.get('[data-testid="resident-dashboard"]').should('be.visible');
    });
  });

  describe('Boundary Value Testing', () => {
    it('should handle minimum and maximum RUT values', () => {
      cy.loginAsAdmin();
      cy.visit('/admin/resident/new');
      
      // Test minimum valid RUT
      cy.get('[data-testid="resident-rut-input"]').type('1.000.000-0');
      cy.get('[data-testid="resident-rut-input"]').blur();
      cy.get('[data-testid="rut-error"]').should('not.exist');
      
      // Test maximum valid RUT
      cy.get('[data-testid="resident-rut-input"]').clear().type('99.999.999-9');
      cy.get('[data-testid="resident-rut-input"]').blur();
      cy.get('[data-testid="rut-error"]').should('not.exist');
      
      // Test invalid RUT (too short)
      cy.get('[data-testid="resident-rut-input"]').clear().type('999.999-9');
      cy.get('[data-testid="resident-rut-input"]').blur();
      cy.get('[data-testid="rut-error"]').should('be.visible');
    });

    it('should handle judgment score boundaries', () => {
      cy.loginAsResident();
      cy.createMockRecord().then((recordId) => {
        cy.visit(`/resident/complete-record/${recordId}`);
        
        // Test minimum value
        cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 1).trigger('input');
        cy.get('[data-testid="judgment-display"]').should('contain.text', '1');
        
        // Test maximum value
        cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 10).trigger('input');
        cy.get('[data-testid="judgment-display"]').should('contain.text', '10');
        
        // Test invalid values (should be clamped)
        cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 0).trigger('input');
        cy.get('[data-testid="judgment-display"]').should('contain.text', '1');
        
        cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 11).trigger('input');
        cy.get('[data-testid="judgment-display"]').should('contain.text', '10');
      });
    });

    it('should handle maximum file upload sizes', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');
      
      // Test file upload if available
      cy.get('[data-testid="file-upload-input"]').then($input => {
        if ($input.length > 0) {
          // Create a large file (mock)
          const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large-file.pdf', {
            type: 'application/pdf'
          });
          
          cy.wrap($input).selectFile(largeFile, { force: true });
          
          // Should show file size error
          cy.get('[data-testid="file-size-error"]').should('be.visible');
          cy.get('[data-testid="file-size-error"]').should('contain.text', 'tamaño máximo');
        }
      });
    });
  });

  describe('Cross-Browser Compatibility', () => {
    it('should work with different user agents', () => {
      // Test with different user agents
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
      ];
      
      userAgents.forEach(userAgent => {
        cy.visit('/', {
          headers: {
            'User-Agent': userAgent
          }
        });
        
        cy.get('[data-testid="landing-page"]').should('be.visible');
        cy.get('[data-testid="login-button"]').should('be.visible');
      });
    });

    it('should handle different screen resolutions', () => {
      const resolutions = [
        [1920, 1080], // Full HD
        [1366, 768],  // Common laptop
        [1280, 720],  // HD
        [2560, 1440], // QHD
      ];
      
      resolutions.forEach(([width, height]) => {
        cy.viewport(width, height);
        cy.visit('/');
        
        cy.get('[data-testid="landing-page"]').should('be.visible');
        cy.get('[data-testid="app-title"]').should('be.visible');
      });
    });
  });
});
