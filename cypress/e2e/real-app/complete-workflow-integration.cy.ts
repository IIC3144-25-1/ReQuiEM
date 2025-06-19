describe('Complete Workflow Integration - End-to-End Real Application Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Complete Surgery Record Lifecycle', () => {
    it('should complete full workflow: Admin creates surgery → Resident creates record → Teacher reviews', () => {
      // Step 1: Admin creates a new surgery
      cy.loginAsAdmin();
      cy.visit('/admin/surgeries/new');
      
      cy.get('form').should('be.visible');
      cy.get('input[name="name"]').type('E2E Test Surgery - Cypress');
      cy.get('input[name="description"]').type('Surgery created for end-to-end testing');
      
      // Select area
      cy.get('select[name="area"]').then($select => {
        if ($select.find('option').length > 1) {
          cy.wrap($select).select(1);
        }
      });
      
      // Add surgery steps
      cy.get('input[name="steps.0.name"]').type('Preparación del campo quirúrgico');
      cy.contains('Agregar paso').click();
      cy.get('input[name="steps.1.name"]').type('Incisión y acceso');
      cy.contains('Agregar paso').click();
      cy.get('input[name="steps.2.name"]').type('Procedimiento principal');
      cy.contains('Agregar paso').click();
      cy.get('input[name="steps.3.name"]').type('Cierre y sutura');
      
      // Add OSAT evaluation
      cy.get('input[name="osats.0.item"]').type('Técnica quirúrgica general');
      cy.get('input[name="osats.0.scale.0.punctuation"]').type('1');
      cy.get('input[name="osats.0.scale.0.description"]').type('Deficiente');
      cy.contains('Agregar escala').click();
      cy.get('input[name="osats.0.scale.1.punctuation"]').type('3');
      cy.get('input[name="osats.0.scale.1.description"]').type('Competente');
      cy.contains('Agregar escala').click();
      cy.get('input[name="osats.0.scale.2.punctuation"]').type('5');
      cy.get('input[name="osats.0.scale.2.description"]').type('Excelente');
      
      // Submit surgery creation
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/admin/surgeries');
      cy.contains('E2E Test Surgery - Cypress').should('be.visible');
      
      // Step 2: Resident creates a record using the new surgery
      cy.loginAsResident();
      cy.visit('/resident/new-record');
      
      cy.get('form').should('be.visible');
      
      // Select the surgery we just created
      cy.get('select').first().select('E2E Test Surgery - Cypress');
      
      // Select teacher
      cy.get('select').eq(1).then($select => {
        if ($select.find('option').length > 1) {
          cy.wrap($select).select(1);
        }
      });
      
      // Fill patient information
      cy.get('input[name="patientId"]').type('11.222.333-4');
      
      // Set date
      cy.get('button').contains('Pick a date').click();
      cy.get('[data-today], .rdp-day_today').click();
      
      // Set time
      cy.get('select').contains('14').parent().select('14');
      cy.get('select').contains('30').parent().select('30');
      
      // Set resident year
      cy.get('select[name="residentsYear"]').select('4');
      
      // Submit record creation
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/resident/complete-record/');
      
      // Step 3: Resident completes the surgery steps
      cy.contains('Completar Registro').should('be.visible');
      
      // Complete all steps
      cy.get('input[type="checkbox"]').each($checkbox => {
        cy.wrap($checkbox).check();
      });
      
      // Set resident self-assessment
      cy.get('input[type="range"]').invoke('val', 8).trigger('input');
      
      // Add detailed comment
      cy.get('textarea[name="residentComment"]').type(
        'Cirugía completada exitosamente. Se siguieron todos los pasos del protocolo. ' +
        'La técnica laparoscópica fue aplicada correctamente. No hubo complicaciones durante el procedimiento. ' +
        'El paciente se encuentra estable en el postoperatorio inmediato.'
      );
      
      // Submit completion
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/resident/records');
      
      // Verify record appears in resident's list
      cy.contains('E2E Test Surgery - Cypress').should('be.visible');
      cy.contains('corrected').should('be.visible'); // Status should be 'corrected'
      
      // Step 4: Teacher reviews the completed record
      cy.loginAsTeacher();
      cy.visit('/teacher/records');
      
      // Find the record to review
      cy.get('body').then($body => {
        if ($body.text().includes('E2E Test Surgery - Cypress')) {
          // Click on the record or review button
          cy.contains('E2E Test Surgery - Cypress').parent().within(() => {
            cy.get('a[href*="/teacher/review/"], button').contains('Revisar').click();
          });
          
          // Should load review form
          cy.url().should('include', '/teacher/review/');
          cy.get('form').should('be.visible');
          
          // Review each step
          cy.get('input[type="checkbox"]').each($checkbox => {
            cy.wrap($checkbox).check(); // Mark as teacher done
          });
          
          // Score each step
          cy.get('select').each($select => {
            if ($select.find('option[value="a"]').length > 0) {
              cy.wrap($select).select('a'); // Give 'a' score
            }
          });
          
          // Fill OSAT evaluations
          cy.get('input[type="number"]').each($input => {
            cy.wrap($input).clear().type('4'); // Score of 4 out of 5
          });
          
          // Set teacher judgment
          cy.get('input[type="range"]').invoke('val', 9).trigger('input');
          
          // Select summary scale
          cy.get('select[name="summaryScale"]').select('A');
          
          // Add comprehensive feedback
          cy.get('textarea[name="feedback"]').type(
            'Excelente desempeño durante la cirugía. El residente demostró dominio técnico y ' +
            'seguimiento adecuado del protocolo. La técnica quirúrgica fue precisa y eficiente. ' +
            'Se recomienda continuar desarrollando habilidades en procedimientos más complejos. ' +
            'Muy buen manejo del instrumental y trabajo en equipo.'
          );
          
          // Submit review
          cy.get('button[type="submit"]').click();
          cy.url().should('include', '/teacher/records');
          
          // Verify record status changed to reviewed
          cy.contains('E2E Test Surgery - Cypress').parent().should('contain.text', 'reviewed');
        }
      });
      
      // Step 5: Resident views the feedback
      cy.loginAsResident();
      cy.visit('/resident/records');
      
      // Find the reviewed record
      cy.contains('E2E Test Surgery - Cypress').click();
      
      // Should show teacher feedback
      cy.contains('Feedback').should('be.visible');
      cy.contains('Excelente desempeño').should('be.visible');
      cy.contains('Evaluación: 9').should('be.visible');
      cy.contains('Escala: A').should('be.visible');
    });
  });

  describe('Multi-User Concurrent Workflow', () => {
    it('should handle multiple residents creating records simultaneously', () => {
      // Simulate multiple residents working at the same time
      
      // Resident 1 creates a record
      cy.loginAsResident({
        name: 'Dr. Resident One',
        email: 'resident1@hospital.cl'
      });
      cy.visit('/resident/new-record');
      cy.get('select').first().select(1);
      cy.get('select').eq(1).select(1);
      cy.get('input[name="patientId"]').type('11.111.111-1');
      cy.get('button').contains('Pick a date').click();
      cy.get('[data-today], .rdp-day_today').click();
      cy.get('button[type="submit"]').click();
      
      // Complete the record
      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="range"]').invoke('val', 7).trigger('input');
      cy.get('textarea[name="residentComment"]').type('Record by Resident 1');
      cy.get('button[type="submit"]').click();
      
      // Resident 2 creates a different record
      cy.loginAsResident({
        name: 'Dr. Resident Two',
        email: 'resident2@hospital.cl'
      });
      cy.visit('/resident/new-record');
      cy.get('select').first().select(1);
      cy.get('select').eq(1).select(1);
      cy.get('input[name="patientId"]').type('22.222.222-2');
      cy.get('button').contains('Pick a date').click();
      cy.get('[data-today], .rdp-day_today').click();
      cy.get('button[type="submit"]').click();
      
      // Complete the record
      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="range"]').invoke('val', 8).trigger('input');
      cy.get('textarea[name="residentComment"]').type('Record by Resident 2');
      cy.get('button[type="submit"]').click();
      
      // Teacher should see both records
      cy.loginAsTeacher();
      cy.visit('/teacher/records');
      cy.contains('11.111.111-1').should('be.visible');
      cy.contains('22.222.222-2').should('be.visible');
    });
  });

  describe('Error Recovery and Data Consistency', () => {
    it('should maintain data consistency during network interruptions', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');
      
      // Fill form
      cy.get('select').first().select(1);
      cy.get('select').eq(1).select(1);
      cy.get('input[name="patientId"]').type('33.333.333-3');
      cy.get('button').contains('Pick a date').click();
      cy.get('[data-today], .rdp-day_today').click();
      
      // Mock network error on first submission
      cy.intercept('POST', '/api/records', { forceNetworkError: true }).as('networkError');
      cy.get('button[type="submit"]').click();
      cy.wait('@networkError');
      
      // Should show error but preserve form data
      cy.get('input[name="patientId"]').should('have.value', '33.333.333-3');
      
      // Remove network error and retry
      cy.intercept('POST', '/api/records').as('successfulSubmit');
      cy.get('button[type="submit"]').click();
      cy.wait('@successfulSubmit');
      
      // Should succeed
      cy.url().should('include', '/resident/complete-record/');
    });

    it('should handle duplicate record prevention', () => {
      cy.loginAsResident();
      
      // Create first record
      cy.visit('/resident/new-record');
      cy.get('select').first().select(1);
      cy.get('select').eq(1).select(1);
      cy.get('input[name="patientId"]').type('44.444.444-4');
      cy.get('button').contains('Pick a date').click();
      cy.get('[data-today], .rdp-day_today').click();
      cy.get('button[type="submit"]').click();
      
      // Complete it
      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="range"]').invoke('val', 7).trigger('input');
      cy.get('textarea[name="residentComment"]').type('First record');
      cy.get('button[type="submit"]').click();
      
      // Try to create duplicate record
      cy.visit('/resident/new-record');
      cy.get('select').first().select(1);
      cy.get('select').eq(1).select(1);
      cy.get('input[name="patientId"]').type('44.444.444-4'); // Same patient
      cy.get('button').contains('Pick a date').click();
      cy.get('[data-today], .rdp-day_today').click(); // Same date
      cy.get('button[type="submit"]').click();
      
      // Should prevent duplicate
      cy.get('body').should('contain.text', 'ya existe');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large datasets efficiently', () => {
      cy.loginAsAdmin();
      cy.visit('/admin/resident');
      
      // Check page loads within reasonable time
      cy.get('.container', { timeout: 5000 }).should('be.visible');
      
      // If pagination exists, test it
      cy.get('body').then($body => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="next-page"]').click();
          cy.get('.container', { timeout: 3000 }).should('be.visible');
        }
      });
    });

    it('should load charts and analytics efficiently', () => {
      cy.loginAsTeacher();
      cy.visit('/teacher/dashboard');
      
      // Charts should load within reasonable time
      cy.get('.grid', { timeout: 5000 }).should('be.visible');
      cy.get('[data-testid="chart-skeleton"], .recharts-wrapper', { timeout: 10000 }).should('exist');
    });
  });

  describe('Cross-Browser and Device Compatibility', () => {
    it('should work on mobile devices', () => {
      cy.setMobileViewport();
      cy.loginAsResident();
      cy.visit('/resident/dashboard');
      
      // Mobile navigation should work
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-nav-menu"]').should('be.visible');
      
      // Forms should be usable on mobile
      cy.visit('/resident/new-record');
      cy.get('form').should('be.visible');
      cy.get('select').first().should('be.visible');
    });

    it('should handle different screen resolutions', () => {
      const resolutions = [
        [1920, 1080], // Full HD
        [1366, 768],  // Common laptop
        [768, 1024],  // Tablet
      ];
      
      resolutions.forEach(([width, height]) => {
        cy.viewport(width, height);
        cy.loginAsResident();
        cy.visit('/resident/dashboard');
        
        cy.get('.container, .max-w-7xl').should('be.visible');
        cy.get('.grid').should('be.visible');
      });
    });
  });
});
