describe('Business Logic and Workflow Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Surgery Record Lifecycle', () => {
    it('should follow complete record lifecycle from creation to review', () => {
      // Step 1: Resident creates record
      cy.loginAsResident({
        id: 'resident-1',
        name: 'Dr. Juan Pérez',
        area: 'Cirugía General'
      });

      cy.visit('/resident/new-record');
      
      // Create record
      cy.get('[data-testid="surgery-select"]').select('Apendicectomía Laparoscópica');
      cy.get('[data-testid="teacher-select"]').select('Dr. María González');
      cy.get('[data-testid="patient-id-input"]').type('12.345.678-9');
      cy.get('[data-testid="date-input"]').type('2024-01-15');
      cy.get('[data-testid="hour-select"]').select('14');
      cy.get('[data-testid="minute-select"]').select('30');
      cy.get('[data-testid="residents-year-select"]').select('3');
      
      cy.get('[data-testid="submit-record-form"]').click();
      
      // Verify record is in 'pending' status
      cy.url().should('include', '/resident/complete-record/');
      cy.get('[data-testid="record-status"]').should('contain.text', 'Pendiente');

      // Step 2: Complete surgery steps
      cy.get('[data-testid="step-checkbox-0"]').check();
      cy.get('[data-testid="step-checkbox-1"]').check();
      cy.get('[data-testid="step-checkbox-2"]').check();
      cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 8).trigger('input');
      cy.get('[data-testid="resident-comment-textarea"]').type('Procedimiento completado exitosamente. Buena técnica aplicada.');
      
      cy.get('[data-testid="submit-steps-form"]').click();
      
      // Verify record moves to 'corrected' status
      cy.visit('/resident/records');
      cy.get('[data-testid="record-item"]').first().should('have.attr', 'data-status', 'corrected');

      // Step 3: Teacher reviews record
      cy.logout();
      cy.loginAsTeacher({
        id: 'teacher-1',
        name: 'Dr. María González',
        area: 'Cirugía General'
      });

      cy.visit('/teacher/records');
      cy.get('[data-testid="record-item"][data-status="corrected"]').first().within(() => {
        cy.get('[data-testid="review-button"]').click();
      });

      // Complete teacher evaluation
      cy.get('[data-testid="step-evaluation-0"] [data-testid="teacher-done-checkbox"]').check();
      cy.get('[data-testid="step-evaluation-0"] [data-testid="step-score-select"]').select('a');
      cy.get('[data-testid="step-evaluation-1"] [data-testid="teacher-done-checkbox"]').check();
      cy.get('[data-testid="step-evaluation-1"] [data-testid="step-score-select"]').select('a');
      cy.get('[data-testid="step-evaluation-2"] [data-testid="teacher-done-checkbox"]').check();
      cy.get('[data-testid="step-evaluation-2"] [data-testid="step-score-select"]').select('b');

      cy.get('[data-testid="osat-evaluation-0"] [data-testid="osat-score-input"]').clear().type('4');
      cy.get('[data-testid="teacher-judgment-slider"]').invoke('val', 8).trigger('input');
      cy.get('[data-testid="summary-scale-select"]').select('A');
      cy.get('[data-testid="feedback-textarea"]').type('Excelente desempeño. Continuar desarrollando habilidades.');

      cy.get('[data-testid="submit-review-button"]').click();

      // Verify record moves to 'reviewed' status
      cy.visit('/teacher/records');
      cy.get('[data-testid="record-item"]').first().should('have.attr', 'data-status', 'reviewed');

      // Step 4: Resident views feedback
      cy.logout();
      cy.loginAsResident({
        id: 'resident-1',
        name: 'Dr. Juan Pérez'
      });

      cy.visit('/resident/records');
      cy.get('[data-testid="record-item"][data-status="reviewed"]').first().click();

      // Verify feedback is visible
      cy.get('[data-testid="teacher-feedback"]').should('be.visible');
      cy.get('[data-testid="teacher-judgment"]').should('contain.text', '8');
      cy.get('[data-testid="summary-scale"]').should('contain.text', 'A');
    });

    it('should handle record corrections and re-submissions', () => {
      cy.loginAsResident();
      cy.createMockRecord().then((recordId) => {
        cy.visit(`/resident/complete-record/${recordId}`);

        // Submit incomplete record
        cy.get('[data-testid="step-checkbox-0"]').check();
        cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 5).trigger('input');
        cy.get('[data-testid="resident-comment-textarea"]').type('Procedimiento parcialmente completado.');
        
        cy.get('[data-testid="submit-steps-form"]').click();

        // Teacher requests corrections
        cy.logout();
        cy.loginAsTeacher();
        cy.visit('/teacher/records');
        
        cy.get(`[data-testid="record-${recordId}"]`).within(() => {
          cy.get('[data-testid="review-button"]').click();
        });

        // Teacher marks as needing corrections
        cy.get('[data-testid="request-corrections-button"]').click();
        cy.get('[data-testid="correction-comment"]').type('Por favor completar todos los pasos del procedimiento.');
        cy.get('[data-testid="submit-corrections-button"]').click();

        // Verify record status changes
        cy.visit('/teacher/records');
        cy.get(`[data-testid="record-${recordId}"]`).should('have.attr', 'data-status', 'needs-correction');

        // Resident makes corrections
        cy.logout();
        cy.loginAsResident();
        cy.visit('/resident/records');
        
        cy.get(`[data-testid="record-${recordId}"]`).within(() => {
          cy.get('[data-testid="edit-record-button"]').click();
        });

        // Complete missing steps
        cy.get('[data-testid="step-checkbox-1"]').check();
        cy.get('[data-testid="step-checkbox-2"]').check();
        cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 8).trigger('input');
        cy.get('[data-testid="resident-comment-textarea"]').clear().type('Procedimiento completado exitosamente tras correcciones.');
        
        cy.get('[data-testid="submit-steps-form"]').click();

        // Verify record returns to corrected status
        cy.visit('/resident/records');
        cy.get(`[data-testid="record-${recordId}"]`).should('have.attr', 'data-status', 'corrected');
      });
    });

    it('should enforce business rules for record creation', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');

      // Test: Cannot create record for future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      cy.get('[data-testid="surgery-select"]').select('Apendicectomía Laparoscópica');
      cy.get('[data-testid="teacher-select"]').select('Dr. María González');
      cy.get('[data-testid="patient-id-input"]').type('12.345.678-9');
      cy.get('[data-testid="date-input"]').type(futureDateString);
      
      cy.get('[data-testid="submit-record-form"]').click();
      
      cy.get('[data-testid="date-error"]').should('be.visible');
      cy.get('[data-testid="date-error"]').should('contain.text', 'futuro');

      // Test: Cannot create duplicate record for same patient on same day
      const today = new Date().toISOString().split('T')[0];
      cy.get('[data-testid="date-input"]').clear().type(today);
      
      // Mock duplicate record response
      cy.intercept('POST', '/api/records', {
        statusCode: 409,
        body: {
          error: 'Duplicate record',
          message: 'Ya existe un registro para este paciente en esta fecha'
        }
      }).as('duplicateRecord');

      cy.get('[data-testid="submit-record-form"]').click();
      cy.wait('@duplicateRecord');

      cy.get('[data-testid="duplicate-error"]').should('be.visible');
      cy.get('[data-testid="duplicate-error"]').should('contain.text', 'ya existe');
    });
  });

  describe('User Role Permissions', () => {
    it('should enforce resident permissions correctly', () => {
      cy.loginAsResident();

      // Residents can create and edit their own records
      cy.visit('/resident/new-record');
      cy.get('[data-testid="record-form"]').should('be.visible');

      cy.visit('/resident/records');
      cy.get('[data-testid="records-list"]').should('be.visible');

      // Residents cannot access admin functions
      cy.visit('/admin/resident', { failOnStatusCode: false });
      cy.url().should('include', '/unauthorized');

      // Residents cannot access teacher functions
      cy.visit('/teacher/records', { failOnStatusCode: false });
      cy.url().should('include', '/unauthorized');

      // Residents cannot edit other residents' records
      cy.request({
        method: 'PUT',
        url: '/api/records/other-resident-record',
        body: { status: 'completed' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it('should enforce teacher permissions correctly', () => {
      cy.loginAsTeacher();

      // Teachers can review records assigned to them
      cy.visit('/teacher/records');
      cy.get('[data-testid="records-list"]').should('be.visible');

      cy.visit('/teacher/dashboard');
      cy.get('[data-testid="teacher-dashboard"]').should('be.visible');

      // Teachers cannot access admin functions
      cy.visit('/admin/resident', { failOnStatusCode: false });
      cy.url().should('include', '/unauthorized');

      // Teachers cannot create surgery records
      cy.visit('/resident/new-record', { failOnStatusCode: false });
      cy.url().should('include', '/unauthorized');

      // Teachers cannot review records not assigned to them
      cy.request({
        method: 'PUT',
        url: '/api/records/unassigned-record/review',
        body: { feedback: 'test' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it('should enforce admin permissions correctly', () => {
      cy.loginAsAdmin();

      // Admins can access all admin functions
      cy.visit('/admin/resident');
      cy.get('[data-testid="residents-table"]').should('be.visible');

      cy.visit('/admin/teacher');
      cy.get('[data-testid="teachers-table"]').should('be.visible');

      cy.visit('/admin/surgeries');
      cy.get('[data-testid="surgeries-table"]').should('be.visible');

      // Admins can access teacher and resident views
      cy.visit('/teacher/dashboard');
      cy.get('[data-testid="teacher-dashboard"]').should('be.visible');

      cy.visit('/resident/dashboard');
      cy.get('[data-testid="resident-dashboard"]').should('be.visible');

      // Admins can manage all users
      cy.request('GET', '/api/admin/users').then((response) => {
        expect(response.status).to.equal(200);
      });
    });
  });

  describe('Data Validation and Business Rules', () => {
    it('should validate surgery-area compatibility', () => {
      cy.loginAsAdmin();
      cy.visit('/admin/surgeries/new');

      // Create surgery in specific area
      cy.get('[data-testid="surgery-name-input"]').type('Cirugía Cardíaca Compleja');
      cy.get('[data-testid="surgery-area-select"]').select('Cardiología');
      cy.get('[data-testid="step-input-0"]').type('Preparación');
      cy.get('[data-testid="osat-item-input-0"]').type('Técnica');
      
      cy.get('[data-testid="submit-surgery-form"]').click();

      // Verify surgery is only available to users in that area
      cy.logout();
      cy.loginAsResident({
        area: 'Cirugía General'
      });

      cy.visit('/resident/new-record');
      cy.get('[data-testid="surgery-select"]').should('not.contain.text', 'Cirugía Cardíaca Compleja');

      cy.logout();
      cy.loginAsResident({
        area: 'Cardiología'
      });

      cy.visit('/resident/new-record');
      cy.get('[data-testid="surgery-select"]').should('contain.text', 'Cirugía Cardíaca Compleja');
    });

    it('should validate teacher-resident area compatibility', () => {
      cy.loginAsResident({
        area: 'Cirugía General'
      });

      cy.visit('/resident/new-record');
      
      // Should only show teachers from same area
      cy.get('[data-testid="teacher-select"] option').each($option => {
        const text = $option.text();
        if (text && text !== 'Seleccionar profesor') {
          // Verify teacher is from same area (this would be validated on backend)
          expect(text).to.not.include('Cardiólogo');
        }
      });
    });

    it('should enforce minimum steps completion', () => {
      cy.loginAsResident();
      cy.createMockRecord().then((recordId) => {
        cy.visit(`/resident/complete-record/${recordId}`);

        // Try to submit without completing minimum required steps
        cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 8).trigger('input');
        cy.get('[data-testid="resident-comment-textarea"]').type('Test comment');
        
        cy.get('[data-testid="submit-steps-form"]').click();

        // Should show validation error
        cy.get('[data-testid="steps-error"]').should('be.visible');
        cy.get('[data-testid="steps-error"]').should('contain.text', 'al menos');
      });
    });

    it('should validate OSAT score ranges', () => {
      cy.loginAsTeacher();
      cy.createMockCompletedRecord().then((recordId) => {
        cy.visit(`/teacher/review/${recordId}`);

        // Try invalid OSAT scores
        cy.get('[data-testid="osat-evaluation-0"] [data-testid="osat-score-input"]').clear().type('0');
        cy.get('[data-testid="submit-review-button"]').click();
        
        cy.get('[data-testid="osat-score-error"]').should('be.visible');

        cy.get('[data-testid="osat-evaluation-0"] [data-testid="osat-score-input"]').clear().type('6');
        cy.get('[data-testid="submit-review-button"]').click();
        
        cy.get('[data-testid="osat-score-error"]').should('be.visible');

        // Valid score should work
        cy.get('[data-testid="osat-evaluation-0"] [data-testid="osat-score-input"]').clear().type('4');
        cy.get('[data-testid="teacher-judgment-slider"]').invoke('val', 8).trigger('input');
        cy.get('[data-testid="summary-scale-select"]').select('A');
        cy.get('[data-testid="feedback-textarea"]').type('Good performance');
        
        cy.get('[data-testid="submit-review-button"]').click();
        cy.get('[data-testid="success-message"]').should('be.visible');
      });
    });
  });

  describe('Notification and Alert System', () => {
    it('should notify teachers of new records to review', () => {
      // Resident completes record
      cy.loginAsResident();
      cy.createMockRecord().then((recordId) => {
        cy.visit(`/resident/complete-record/${recordId}`);
        
        cy.get('[data-testid="step-checkbox-0"]').check();
        cy.get('[data-testid="step-checkbox-1"]').check();
        cy.get('[data-testid="step-checkbox-2"]').check();
        cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 8).trigger('input');
        cy.get('[data-testid="resident-comment-textarea"]').type('Completed successfully');
        
        cy.get('[data-testid="submit-steps-form"]').click();

        // Teacher should receive notification
        cy.logout();
        cy.loginAsTeacher();
        cy.visit('/teacher/dashboard');

        cy.get('[data-testid="notification-bell"]').should('have.class', 'has-notifications');
        cy.get('[data-testid="notification-bell"]').click();
        cy.get('[data-testid="notification-list"]').should('contain.text', 'Nuevo registro para revisar');
      });
    });

    it('should notify residents of completed reviews', () => {
      // Teacher completes review
      cy.loginAsTeacher();
      cy.createMockCompletedRecord().then((recordId) => {
        cy.visit(`/teacher/review/${recordId}`);
        
        // Complete review
        cy.get('[data-testid="step-evaluation-0"] [data-testid="teacher-done-checkbox"]').check();
        cy.get('[data-testid="step-evaluation-0"] [data-testid="step-score-select"]').select('a');
        cy.get('[data-testid="osat-evaluation-0"] [data-testid="osat-score-input"]').clear().type('4');
        cy.get('[data-testid="teacher-judgment-slider"]').invoke('val', 8).trigger('input');
        cy.get('[data-testid="summary-scale-select"]').select('A');
        cy.get('[data-testid="feedback-textarea"]').type('Excellent work');
        
        cy.get('[data-testid="submit-review-button"]').click();

        // Resident should receive notification
        cy.logout();
        cy.loginAsResident();
        cy.visit('/resident/dashboard');

        cy.get('[data-testid="notification-bell"]').should('have.class', 'has-notifications');
        cy.get('[data-testid="notification-bell"]').click();
        cy.get('[data-testid="notification-list"]').should('contain.text', 'Revisión completada');
      });
    });

    it('should send deadline reminders', () => {
      cy.loginAsResident();
      
      // Mock overdue record
      cy.intercept('GET', '/api/records*', {
        statusCode: 200,
        body: {
          records: [{
            id: 'overdue-record',
            status: 'pending',
            createdAt: '2024-01-01T00:00:00Z',
            dueDate: '2024-01-07T23:59:59Z',
            isOverdue: true
          }],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }).as('getOverdueRecords');

      cy.visit('/resident/records');
      cy.wait('@getOverdueRecords');

      // Should show overdue indicator
      cy.get('[data-testid="record-overdue-indicator"]').should('be.visible');
      cy.get('[data-testid="overdue-warning"]').should('be.visible');
    });
  });

  describe('Reporting and Analytics', () => {
    it('should generate resident performance reports', () => {
      cy.loginAsTeacher();
      cy.visit('/teacher/dashboard');

      // Select resident for analysis
      cy.get('[data-testid="resident-select"]').select('Dr. Juan Pérez');

      // Generate report
      cy.get('[data-testid="generate-report-button"]').click();
      cy.get('[data-testid="report-type-select"]').select('performance-summary');
      cy.get('[data-testid="date-range-start"]').type('2024-01-01');
      cy.get('[data-testid="date-range-end"]').type('2024-01-31');
      
      cy.get('[data-testid="generate-report-submit"]').click();

      // Verify report generation
      cy.get('[data-testid="report-preview"]').should('be.visible');
      cy.get('[data-testid="download-report-button"]').should('be.visible');
    });

    it('should track surgery completion statistics', () => {
      cy.loginAsAdmin();
      cy.visit('/admin/analytics');

      // View surgery statistics
      cy.get('[data-testid="surgery-stats-chart"]').should('be.visible');
      cy.get('[data-testid="completion-rate-metric"]').should('be.visible');
      cy.get('[data-testid="average-score-metric"]').should('be.visible');

      // Filter by area
      cy.get('[data-testid="area-filter"]').select('Cirugía General');
      cy.get('[data-testid="apply-filter"]').click();

      // Charts should update
      cy.get('[data-testid="surgery-stats-chart"]').should('be.visible');
    });
  });
});
