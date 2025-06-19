describe('Form Validation Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Surgery Record Form Validation', () => {
    beforeEach(() => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');
    });

    it('should show validation errors for empty required fields', () => {
      // Try to submit empty form
      cy.get('[data-testid="submit-record-form"]').click();
      
      // Check for validation errors
      cy.get('[data-testid="surgery-error"]').should('be.visible');
      cy.get('[data-testid="surgery-error"]').should('contain.text', 'requerido');
      
      cy.get('[data-testid="teacher-error"]').should('be.visible');
      cy.get('[data-testid="teacher-error"]').should('contain.text', 'requerido');
      
      cy.get('[data-testid="patient-id-error"]').should('be.visible');
      cy.get('[data-testid="patient-id-error"]').should('contain.text', 'requerido');
    });

    it('should validate patient ID format (RUT)', () => {
      // Test invalid RUT formats
      const invalidRuts = ['123456789', '12.345.678', '12345678-9', 'abc.def.ghi-j'];
      
      invalidRuts.forEach((invalidRut) => {
        cy.get('[data-testid="patient-id-input"]').clear().type(invalidRut);
        cy.get('[data-testid="submit-record-form"]').click();
        cy.get('[data-testid="patient-id-error"]').should('be.visible');
        cy.get('[data-testid="patient-id-error"]').should('contain.text', 'formato válido');
      });
    });

    it('should accept valid patient ID format', () => {
      // Fill form with valid data
      cy.get('[data-testid="surgery-select"]').select('Apendicectomía Laparoscópica');
      cy.get('[data-testid="teacher-select"]').select('Dr. María González');
      cy.get('[data-testid="patient-id-input"]').type('12.345.678-9');
      
      const today = new Date().toISOString().split('T')[0];
      cy.get('[data-testid="date-input"]').type(today);
      cy.get('[data-testid="hour-select"]').select('14');
      cy.get('[data-testid="minute-select"]').select('30');
      cy.get('[data-testid="residents-year-select"]').select('3');
      
      cy.get('[data-testid="submit-record-form"]').click();
      
      // Should not show validation errors and should redirect
      cy.get('[data-testid="patient-id-error"]').should('not.exist');
      cy.url().should('include', '/resident/complete-record/');
    });

    it('should validate date is not in the future', () => {
      // Set future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      cy.get('[data-testid="date-input"]').type(futureDateString);
      cy.get('[data-testid="submit-record-form"]').click();
      
      cy.get('[data-testid="date-error"]').should('be.visible');
      cy.get('[data-testid="date-error"]').should('contain.text', 'futuro');
    });

    it('should validate time format', () => {
      // Test invalid time combinations
      cy.get('[data-testid="hour-select"]').select('25'); // Invalid hour
      cy.get('[data-testid="minute-select"]').select('65'); // Invalid minute
      
      cy.get('[data-testid="submit-record-form"]').click();
      
      cy.get('[data-testid="time-error"]').should('be.visible');
    });
  });

  describe('Surgery Steps Form Validation', () => {
    beforeEach(() => {
      cy.loginAsResident();
      cy.createMockRecord().then((recordId) => {
        cy.visit(`/resident/complete-record/${recordId}`);
      });
    });

    it('should require at least one step to be completed', () => {
      // Try to submit without completing any steps
      cy.get('[data-testid="submit-steps-form"]').click();
      
      cy.get('[data-testid="steps-error"]').should('be.visible');
      cy.get('[data-testid="steps-error"]').should('contain.text', 'al menos un paso');
    });

    it('should validate resident judgment range', () => {
      // Test invalid judgment values
      cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 11).trigger('input');
      cy.get('[data-testid="submit-steps-form"]').click();
      
      cy.get('[data-testid="judgment-error"]').should('be.visible');
      cy.get('[data-testid="judgment-error"]').should('contain.text', '1 y 10');
    });

    it('should require resident comment when judgment is low', () => {
      // Set low judgment score
      cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 3).trigger('input');
      cy.get('[data-testid="submit-steps-form"]').click();
      
      cy.get('[data-testid="comment-error"]').should('be.visible');
      cy.get('[data-testid="comment-error"]').should('contain.text', 'comentario es requerido');
    });

    it('should validate comment length', () => {
      // Test comment too short
      cy.get('[data-testid="resident-comment-textarea"]').type('abc');
      cy.get('[data-testid="submit-steps-form"]').click();
      
      cy.get('[data-testid="comment-error"]').should('be.visible');
      cy.get('[data-testid="comment-error"]').should('contain.text', 'mínimo 10 caracteres');
      
      // Test comment too long
      const longComment = 'a'.repeat(1001);
      cy.get('[data-testid="resident-comment-textarea"]').clear().type(longComment);
      cy.get('[data-testid="submit-steps-form"]').click();
      
      cy.get('[data-testid="comment-error"]').should('be.visible');
      cy.get('[data-testid="comment-error"]').should('contain.text', 'máximo 1000 caracteres');
    });
  });

  describe('Teacher Review Form Validation', () => {
    beforeEach(() => {
      cy.loginAsTeacher();
      cy.createMockCompletedRecord().then((recordId) => {
        cy.visit(`/teacher/review/${recordId}`);
      });
    });

    it('should require teacher judgment', () => {
      cy.get('[data-testid="submit-review-button"]').click();
      
      cy.get('[data-testid="teacher-judgment-error"]').should('be.visible');
      cy.get('[data-testid="teacher-judgment-error"]').should('contain.text', 'requerido');
    });

    it('should require summary scale selection', () => {
      cy.get('[data-testid="teacher-judgment-slider"]').invoke('val', 8).trigger('input');
      cy.get('[data-testid="submit-review-button"]').click();
      
      cy.get('[data-testid="summary-scale-error"]').should('be.visible');
      cy.get('[data-testid="summary-scale-error"]').should('contain.text', 'requerido');
    });

    it('should require feedback text', () => {
      cy.get('[data-testid="teacher-judgment-slider"]').invoke('val', 8).trigger('input');
      cy.get('[data-testid="summary-scale-select"]').select('A');
      cy.get('[data-testid="submit-review-button"]').click();
      
      cy.get('[data-testid="feedback-error"]').should('be.visible');
      cy.get('[data-testid="feedback-error"]').should('contain.text', 'requerido');
    });

    it('should validate OSAT scores range', () => {
      // Test invalid OSAT score
      cy.get('[data-testid="osat-evaluation-0"] [data-testid="osat-score-input"]').clear().type('6');
      cy.get('[data-testid="submit-review-button"]').click();
      
      cy.get('[data-testid="osat-score-error"]').should('be.visible');
      cy.get('[data-testid="osat-score-error"]').should('contain.text', '1 y 5');
    });

    it('should validate step score selection', () => {
      // Leave step score unselected
      cy.get('[data-testid="step-evaluation-0"] [data-testid="teacher-done-checkbox"]').check();
      cy.get('[data-testid="submit-review-button"]').click();
      
      cy.get('[data-testid="step-score-error"]').should('be.visible');
      cy.get('[data-testid="step-score-error"]').should('contain.text', 'requerido');
    });

    it('should validate feedback length', () => {
      // Test feedback too short
      cy.get('[data-testid="teacher-judgment-slider"]').invoke('val', 8).trigger('input');
      cy.get('[data-testid="summary-scale-select"]').select('A');
      cy.get('[data-testid="feedback-textarea"]').type('abc');
      cy.get('[data-testid="submit-review-button"]').click();
      
      cy.get('[data-testid="feedback-error"]').should('be.visible');
      cy.get('[data-testid="feedback-error"]').should('contain.text', 'mínimo 20 caracteres');
    });
  });

  describe('Admin Forms Validation', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    describe('Resident Creation Form', () => {
      beforeEach(() => {
        cy.visit('/admin/resident/new');
      });

      it('should validate required fields', () => {
        cy.get('[data-testid="submit-resident-form"]').click();
        
        cy.get('[data-testid="name-error"]').should('be.visible');
        cy.get('[data-testid="email-error"]').should('be.visible');
        cy.get('[data-testid="rut-error"]').should('be.visible');
        cy.get('[data-testid="area-error"]').should('be.visible');
      });

      it('should validate email format', () => {
        cy.get('[data-testid="resident-email-input"]').type('invalid-email');
        cy.get('[data-testid="submit-resident-form"]').click();
        
        cy.get('[data-testid="email-error"]').should('be.visible');
        cy.get('[data-testid="email-error"]').should('contain.text', 'email válido');
      });

      it('should validate RUT format', () => {
        cy.get('[data-testid="resident-rut-input"]').type('invalid-rut');
        cy.get('[data-testid="submit-resident-form"]').click();
        
        cy.get('[data-testid="rut-error"]').should('be.visible');
        cy.get('[data-testid="rut-error"]').should('contain.text', 'RUT válido');
      });
    });

    describe('Surgery Creation Form', () => {
      beforeEach(() => {
        cy.visit('/admin/surgeries/new');
      });

      it('should validate required fields', () => {
        cy.get('[data-testid="submit-surgery-form"]').click();
        
        cy.get('[data-testid="surgery-name-error"]').should('be.visible');
        cy.get('[data-testid="surgery-area-error"]').should('be.visible');
        cy.get('[data-testid="steps-error"]').should('be.visible');
        cy.get('[data-testid="osats-error"]').should('be.visible');
      });

      it('should require at least one step', () => {
        cy.get('[data-testid="surgery-name-input"]').type('Test Surgery');
        cy.get('[data-testid="surgery-area-select"]').select('Cirugía General');
        
        // Remove all steps
        cy.get('[data-testid="remove-step-button"]').click({ multiple: true });
        
        cy.get('[data-testid="submit-surgery-form"]').click();
        
        cy.get('[data-testid="steps-error"]').should('be.visible');
        cy.get('[data-testid="steps-error"]').should('contain.text', 'al menos un paso');
      });

      it('should require at least one OSAT criterion', () => {
        cy.get('[data-testid="surgery-name-input"]').type('Test Surgery');
        cy.get('[data-testid="surgery-area-select"]').select('Cirugía General');
        cy.get('[data-testid="step-input-0"]').type('Test Step');
        
        // Remove all OSAT criteria
        cy.get('[data-testid="remove-osat-button"]').click({ multiple: true });
        
        cy.get('[data-testid="submit-surgery-form"]').click();
        
        cy.get('[data-testid="osats-error"]').should('be.visible');
        cy.get('[data-testid="osats-error"]').should('contain.text', 'al menos un criterio OSAT');
      });
    });
  });

  describe('Real-time Validation', () => {
    it('should show validation errors in real-time', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');
      
      // Test real-time email validation
      cy.get('[data-testid="patient-id-input"]').type('invalid');
      cy.get('[data-testid="patient-id-input"]').blur();
      cy.get('[data-testid="patient-id-error"]').should('be.visible');
      
      // Fix the error
      cy.get('[data-testid="patient-id-input"]').clear().type('12.345.678-9');
      cy.get('[data-testid="patient-id-input"]').blur();
      cy.get('[data-testid="patient-id-error"]').should('not.exist');
    });

    it('should update validation state as user types', () => {
      cy.loginAsResident();
      cy.createMockRecord().then((recordId) => {
        cy.visit(`/resident/complete-record/${recordId}`);
      });
      
      // Test comment length validation
      cy.get('[data-testid="resident-comment-textarea"]').type('abc');
      cy.get('[data-testid="comment-length-indicator"]').should('contain.text', '3/10');
      cy.get('[data-testid="comment-error"]').should('be.visible');
      
      cy.get('[data-testid="resident-comment-textarea"]').type('defghijklm');
      cy.get('[data-testid="comment-length-indicator"]').should('contain.text', '13/10');
      cy.get('[data-testid="comment-error"]').should('not.exist');
    });
  });
});
