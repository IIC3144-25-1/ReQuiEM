describe('Complete End-to-End Workflows', () => {
  let recordId: string;
  let residentData: any;
  let teacherData: any;

  beforeEach(() => {
    // Set up test data
    residentData = {
      name: 'Dr. Juan Pérez',
      email: 'juan.perez@hospital.cl',
      role: 'resident',
      rut: '12.345.678-9'
    };

    teacherData = {
      name: 'Dr. María González',
      email: 'maria.gonzalez@hospital.cl',
      role: 'teacher',
      rut: '98.765.432-1'
    };
  });

  describe('Complete Surgery Record Workflow', () => {
    it('should complete full workflow from record creation to teacher review', () => {
      // Step 1: Resident creates a new surgery record
      cy.loginAsResident(residentData);
      cy.visit('/resident/new-record');

      // Fill out the record form
      cy.get('[data-testid="surgery-select"]').select('Apendicectomía Laparoscópica');
      cy.get('[data-testid="teacher-select"]').select('Dr. María González');
      cy.get('[data-testid="patient-id-input"]').type('11.222.333-4');
      
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      cy.get('[data-testid="date-input"]').type(dateString);
      cy.get('[data-testid="hour-select"]').select('14');
      cy.get('[data-testid="minute-select"]').select('30');
      cy.get('[data-testid="residents-year-select"]').select('3');

      cy.get('[data-testid="submit-record-form"]').click();

      // Should redirect to complete record page
      cy.url().should('include', '/resident/complete-record/');
      
      // Extract record ID from URL
      cy.url().then((url) => {
        recordId = url.split('/').pop()!;
      });

      // Step 2: Resident completes the surgery steps
      cy.get('[data-testid="steps-form"]').should('be.visible');
      
      // Mark all steps as completed
      cy.get('[data-testid="step-checkbox-0"]').check();
      cy.get('[data-testid="step-checkbox-1"]').check();
      cy.get('[data-testid="step-checkbox-2"]').check();
      
      // Set self-assessment
      cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 8).trigger('input');
      cy.get('[data-testid="resident-comment-textarea"]').type('Procedimiento realizado exitosamente. Buena técnica laparoscópica aplicada. El paciente evolucionó favorablemente.');

      cy.get('[data-testid="submit-steps-form"]').click();

      // Verify record is now in "corrected" status
      cy.visit('/resident/records');
      cy.get(`[data-testid="record-${recordId}"]`).should('have.attr', 'data-status', 'corrected');

      // Step 3: Teacher reviews the record
      cy.logout();
      cy.loginAsTeacher(teacherData);
      cy.visit('/teacher/records');

      // Find the record and start review
      cy.get(`[data-testid="record-${recordId}"]`).within(() => {
        cy.get('[data-testid="review-button"]').click();
      });

      cy.url().should('include', `/teacher/review/${recordId}`);

      // Step 4: Teacher evaluates the record
      cy.get('[data-testid="review-form"]').should('be.visible');

      // Evaluate steps
      cy.get('[data-testid="step-evaluation-0"]').within(() => {
        cy.get('[data-testid="teacher-done-checkbox"]').check();
        cy.get('[data-testid="step-score-select"]').select('a');
      });

      cy.get('[data-testid="step-evaluation-1"]').within(() => {
        cy.get('[data-testid="teacher-done-checkbox"]').check();
        cy.get('[data-testid="step-score-select"]').select('a');
      });

      cy.get('[data-testid="step-evaluation-2"]').within(() => {
        cy.get('[data-testid="teacher-done-checkbox"]').check();
        cy.get('[data-testid="step-score-select"]').select('b');
      });

      // Evaluate OSAT criteria
      cy.get('[data-testid="osat-evaluation-0"]').within(() => {
        cy.get('[data-testid="osat-score-input"]').clear().type('4');
      });

      // Provide overall assessment
      cy.get('[data-testid="teacher-judgment-slider"]').invoke('val', 8).trigger('input');
      cy.get('[data-testid="summary-scale-select"]').select('A');
      cy.get('[data-testid="feedback-textarea"]').type('Excelente desempeño. El residente demostró dominio técnico y buen juicio clínico. Continuar desarrollando habilidades de comunicación con el equipo.');

      cy.get('[data-testid="submit-review-button"]').click();

      // Verify review completion
      cy.get('[data-testid="success-message"]').should('contain.text', 'Revisión completada exitosamente');
      cy.url().should('include', '/teacher/records');

      // Step 5: Verify record status change
      cy.get(`[data-testid="record-${recordId}"]`).should('have.attr', 'data-status', 'reviewed');

      // Step 6: Resident views the feedback
      cy.logout();
      cy.loginAsResident(residentData);
      cy.visit('/resident/records');

      cy.get(`[data-testid="record-${recordId}"]`).click();
      cy.url().should('include', `/resident/records/${recordId}`);

      // Verify feedback is visible
      cy.get('[data-testid="teacher-feedback"]').should('be.visible');
      cy.get('[data-testid="teacher-feedback"]').should('contain.text', 'Excelente desempeño');
      cy.get('[data-testid="teacher-judgment"]').should('contain.text', '8');
      cy.get('[data-testid="summary-scale"]').should('contain.text', 'A');
      cy.get('[data-testid="osat-scores"]').should('be.visible');
    });
  });

  describe('Admin User Management Workflow', () => {
    it('should complete admin workflow for creating and managing users', () => {
      // Step 1: Admin creates a new area
      cy.loginAsAdmin();
      cy.visit('/admin/areas');

      cy.get('[data-testid="create-area-button"]').click();
      cy.get('[data-testid="area-name-input"]').type('Cirugía Pediátrica');
      cy.get('[data-testid="area-description-input"]').type('Especialidad quirúrgica para pacientes pediátricos');
      cy.get('[data-testid="submit-area-form"]').click();

      cy.get('[data-testid="success-message"]').should('be.visible');

      // Step 2: Admin creates a new surgery
      cy.visit('/admin/surgeries');
      cy.get('[data-testid="create-surgery-button"]').click();

      cy.get('[data-testid="surgery-name-input"]').type('Herniorrafia Inguinal Pediátrica');
      cy.get('[data-testid="surgery-description-input"]').type('Reparación de hernia inguinal en pacientes pediátricos');
      cy.get('[data-testid="surgery-area-select"]').select('Cirugía Pediátrica');

      // Add steps
      cy.get('[data-testid="step-input-0"]').type('Preparación del paciente');
      cy.get('[data-testid="add-step-button"]').click();
      cy.get('[data-testid="step-input-1"]').type('Incisión y exposición');
      cy.get('[data-testid="add-step-button"]').click();
      cy.get('[data-testid="step-input-2"]').type('Reparación del defecto');

      // Add OSAT
      cy.get('[data-testid="osat-item-input-0"]').type('Técnica quirúrgica');
      cy.get('[data-testid="osat-scale-punctuation-0-0"]').type('1');
      cy.get('[data-testid="osat-scale-description-0-0"]').type('Deficiente');

      cy.get('[data-testid="submit-surgery-form"]').click();
      cy.get('[data-testid="success-message"]').should('be.visible');

      // Step 3: Admin creates a teacher
      cy.visit('/admin/teacher');
      cy.get('[data-testid="create-teacher-button"]').click();

      cy.get('[data-testid="teacher-name-input"]').type('Dr. Carlos Mendoza');
      cy.get('[data-testid="teacher-email-input"]').type('carlos.mendoza@hospital.cl');
      cy.get('[data-testid="teacher-rut-input"]').type('15.678.901-2');
      cy.get('[data-testid="teacher-area-select"]').select('Cirugía Pediátrica');

      cy.get('[data-testid="submit-teacher-form"]').click();
      cy.get('[data-testid="success-message"]').should('be.visible');

      // Step 4: Admin creates a resident
      cy.visit('/admin/resident');
      cy.get('[data-testid="create-resident-button"]').click();

      cy.get('[data-testid="resident-name-input"]').type('Dr. Ana Silva');
      cy.get('[data-testid="resident-email-input"]').type('ana.silva@hospital.cl');
      cy.get('[data-testid="resident-rut-input"]').type('19.876.543-2');
      cy.get('[data-testid="resident-area-select"]').select('Cirugía Pediátrica');

      cy.get('[data-testid="submit-resident-form"]').click();
      cy.get('[data-testid="success-message"]').should('be.visible');

      // Step 5: Verify all entities are created and linked
      cy.visit('/admin/areas');
      cy.get('[data-testid="areas-table"]').should('contain.text', 'Cirugía Pediátrica');

      cy.visit('/admin/surgeries');
      cy.get('[data-testid="surgeries-table"]').should('contain.text', 'Herniorrafia Inguinal Pediátrica');

      cy.visit('/admin/teacher');
      cy.get('[data-testid="teachers-table"]').should('contain.text', 'Dr. Carlos Mendoza');

      cy.visit('/admin/resident');
      cy.get('[data-testid="residents-table"]').should('contain.text', 'Dr. Ana Silva');
    });
  });

  describe('Multi-User Collaboration Workflow', () => {
    it('should handle multiple residents and teachers working simultaneously', () => {
      // Create multiple records by different residents
      const residents = [
        { name: 'Dr. Juan Pérez', email: 'juan.perez@hospital.cl' },
        { name: 'Dr. Ana Silva', email: 'ana.silva@hospital.cl' }
      ];

      const recordIds: string[] = [];

      residents.forEach((resident, index) => {
        cy.loginAsResident(resident);
        cy.visit('/resident/new-record');

        // Create record
        cy.get('[data-testid="surgery-select"]').select('Apendicectomía Laparoscópica');
        cy.get('[data-testid="teacher-select"]').select('Dr. María González');
        cy.get('[data-testid="patient-id-input"]').type(`${index + 1}1.222.333-4`);
        
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        cy.get('[data-testid="date-input"]').type(dateString);
        cy.get('[data-testid="hour-select"]').select('14');
        cy.get('[data-testid="minute-select"]').select('30');
        cy.get('[data-testid="residents-year-select"]').select('3');

        cy.get('[data-testid="submit-record-form"]').click();

        // Complete the record
        cy.get('[data-testid="step-checkbox-0"]').check();
        cy.get('[data-testid="step-checkbox-1"]').check();
        cy.get('[data-testid="step-checkbox-2"]').check();
        cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 7 + index).trigger('input');
        cy.get('[data-testid="resident-comment-textarea"]').type(`Comentario del residente ${index + 1}`);
        cy.get('[data-testid="submit-steps-form"]').click();

        cy.url().then((url) => {
          recordIds.push(url.split('/').pop()!);
        });

        cy.logout();
      });

      // Teacher reviews all records
      cy.loginAsTeacher(teacherData);
      cy.visit('/teacher/records');

      recordIds.forEach((id, index) => {
        cy.get(`[data-testid="record-${id}"]`).within(() => {
          cy.get('[data-testid="review-button"]').click();
        });

        // Complete review
        cy.get('[data-testid="step-evaluation-0"] [data-testid="teacher-done-checkbox"]').check();
        cy.get('[data-testid="step-evaluation-0"] [data-testid="step-score-select"]').select('a');
        cy.get('[data-testid="osat-evaluation-0"] [data-testid="osat-score-input"]').clear().type('4');
        cy.get('[data-testid="teacher-judgment-slider"]').invoke('val', 8).trigger('input');
        cy.get('[data-testid="summary-scale-select"]').select('A');
        cy.get('[data-testid="feedback-textarea"]').type(`Feedback para residente ${index + 1}`);
        cy.get('[data-testid="submit-review-button"]').click();

        cy.visit('/teacher/records');
      });

      // Verify all records are reviewed
      recordIds.forEach((id) => {
        cy.get(`[data-testid="record-${id}"]`).should('have.attr', 'data-status', 'reviewed');
      });
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should handle and recover from various error scenarios', () => {
      // Test network error during record creation
      cy.loginAsResident(residentData);
      cy.visit('/resident/new-record');

      // Mock network error
      cy.intercept('POST', '/api/records', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('createRecordError');

      cy.get('[data-testid="surgery-select"]').select('Apendicectomía Laparoscópica');
      cy.get('[data-testid="teacher-select"]').select('Dr. María González');
      cy.get('[data-testid="patient-id-input"]').type('11.222.333-4');
      cy.get('[data-testid="submit-record-form"]').click();

      cy.wait('@createRecordError');
      cy.get('[data-testid="error-message"]').should('be.visible');

      // Retry after fixing network
      cy.intercept('POST', '/api/records', { statusCode: 200, body: { id: 'new-record-id' } }).as('createRecordSuccess');
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@createRecordSuccess');
      cy.get('[data-testid="success-message"]').should('be.visible');
    });
  });
});
