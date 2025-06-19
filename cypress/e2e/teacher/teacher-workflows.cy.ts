describe('Teacher Workflows', () => {
  beforeEach(() => {
    // Mock teacher authentication
    cy.loginAsTeacher();
    cy.visit('/');
  });

  describe('Teacher Dashboard Access', () => {
    it('should access teacher dashboard', () => {
      cy.visit('/teacher/dashboard');
      cy.get('[data-testid="teacher-dashboard"]').should('be.visible');
      cy.get('[data-testid="dashboard-title"]').should('contain.text', 'Dashboard');
    });

    it('should display resident selector', () => {
      cy.visit('/teacher/dashboard');
      
      // Check for resident selection dropdown
      cy.get('[data-testid="resident-select"]').should('be.visible');
      cy.get('[data-testid="resident-select"]').should('contain.text', 'Seleccionar residente');
    });

    it('should display charts for selected resident', () => {
      cy.visit('/teacher/dashboard');
      
      // Select a resident
      cy.get('[data-testid="resident-select"]').select('Test Resident');
      
      // Check for charts
      cy.get('[data-testid="records-completed-chart"]').should('be.visible');
      cy.get('[data-testid="surgery-types-chart"]').should('be.visible');
      cy.get('[data-testid="steps-completed-chart"]').should('be.visible');
    });

    it('should navigate to records from dashboard', () => {
      cy.visit('/teacher/dashboard');
      cy.get('[data-testid="view-records-button"]').click();
      cy.url().should('include', '/teacher/records');
    });
  });

  describe('Reviewing Surgery Records', () => {
    beforeEach(() => {
      cy.visit('/teacher/records');
    });

    it('should display records awaiting review', () => {
      cy.get('[data-testid="records-list"]').should('be.visible');
      cy.get('[data-testid="records-filter"]').should('be.visible');
    });

    it('should filter records by status', () => {
      // Test status filters
      cy.get('[data-testid="status-filter"]').select('corrected');
      cy.get('[data-testid="records-list"] [data-status="corrected"]').should('be.visible');
      
      cy.get('[data-testid="status-filter"]').select('pending');
      cy.get('[data-testid="records-list"] [data-status="pending"]').should('be.visible');
    });

    it('should filter records by resident', () => {
      cy.get('[data-testid="resident-filter"]').select('Test Resident');
      cy.get('[data-testid="records-list"]').should('contain.text', 'Test Resident');
    });

    it('should start reviewing a record', () => {
      // Click on a record that needs review
      cy.get('[data-testid="record-item"][data-status="corrected"]').first().within(() => {
        cy.get('[data-testid="review-button"]').click();
      });
      
      cy.url().should('include', '/teacher/review/');
      cy.get('[data-testid="review-form"]').should('be.visible');
    });
  });

  describe('Record Review Process', () => {
    beforeEach(() => {
      // Navigate to a specific record review
      cy.createMockCompletedRecord().then((recordId) => {
        cy.visit(`/teacher/review/${recordId}`);
      });
    });

    it('should display record information', () => {
      cy.get('[data-testid="review-form"]').should('be.visible');
      cy.get('[data-testid="surgery-info"]').should('be.visible');
      cy.get('[data-testid="resident-info"]').should('be.visible');
      cy.get('[data-testid="record-date"]').should('be.visible');
    });

    it('should display resident completed steps', () => {
      cy.get('[data-testid="resident-steps"]').should('be.visible');
      cy.get('[data-testid="resident-judgment"]').should('be.visible');
      cy.get('[data-testid="resident-comment"]').should('be.visible');
    });

    it('should allow teacher to evaluate steps', () => {
      // Evaluate each step
      cy.get('[data-testid="step-evaluation-0"]').within(() => {
        cy.get('[data-testid="teacher-done-checkbox"]').check();
        cy.get('[data-testid="step-score-select"]').select('a');
      });
      
      cy.get('[data-testid="step-evaluation-1"]').within(() => {
        cy.get('[data-testid="teacher-done-checkbox"]').check();
        cy.get('[data-testid="step-score-select"]').select('b');
      });
      
      cy.get('[data-testid="step-evaluation-2"]').within(() => {
        cy.get('[data-testid="teacher-done-checkbox"]').check();
        cy.get('[data-testid="step-score-select"]').select('a');
      });
    });

    it('should allow OSAT evaluation', () => {
      // Evaluate OSAT criteria
      cy.get('[data-testid="osat-evaluation-0"]').within(() => {
        cy.get('[data-testid="osat-score-input"]').clear().type('4');
      });
      
      cy.get('[data-testid="osat-evaluation-1"]').within(() => {
        cy.get('[data-testid="osat-score-input"]').clear().type('5');
      });
    });

    it('should provide overall assessment', () => {
      // Set teacher judgment
      cy.get('[data-testid="teacher-judgment-slider"]').invoke('val', 7).trigger('input');
      
      // Set summary scale
      cy.get('[data-testid="summary-scale-select"]').select('B');
      
      // Provide feedback
      cy.get('[data-testid="feedback-textarea"]').type('Excelente técnica quirúrgica. El residente demostró buen conocimiento anatómico y destreza manual. Áreas de mejora: comunicación con el equipo quirúrgico.');
    });

    it('should complete the review successfully', () => {
      // Fill all required fields
      cy.get('[data-testid="step-evaluation-0"] [data-testid="teacher-done-checkbox"]').check();
      cy.get('[data-testid="step-evaluation-0"] [data-testid="step-score-select"]').select('a');
      
      cy.get('[data-testid="osat-evaluation-0"] [data-testid="osat-score-input"]').clear().type('4');
      
      cy.get('[data-testid="teacher-judgment-slider"]').invoke('val', 8).trigger('input');
      cy.get('[data-testid="summary-scale-select"]').select('A');
      cy.get('[data-testid="feedback-textarea"]').type('Excelente desempeño general.');
      
      // Submit review
      cy.get('[data-testid="submit-review-button"]').click();
      
      // Should redirect to records list
      cy.url().should('include', '/teacher/records');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Revisión completada exitosamente');
    });

    it('should validate required fields', () => {
      // Try to submit without completing required fields
      cy.get('[data-testid="submit-review-button"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="teacher-judgment-error"]').should('be.visible');
      cy.get('[data-testid="summary-scale-error"]').should('be.visible');
      cy.get('[data-testid="feedback-error"]').should('be.visible');
    });

    it('should save review as draft', () => {
      // Partially fill the form
      cy.get('[data-testid="teacher-judgment-slider"]').invoke('val', 6).trigger('input');
      cy.get('[data-testid="feedback-textarea"]').type('Revisión en progreso...');
      
      // Save as draft
      cy.get('[data-testid="save-draft-button"]').click();
      
      // Should show save confirmation
      cy.get('[data-testid="draft-saved-message"]').should('be.visible');
    });
  });

  describe('Record Management', () => {
    beforeEach(() => {
      cy.visit('/teacher/records');
    });

    it('should view completed record details', () => {
      // Click on a reviewed record
      cy.get('[data-testid="record-item"][data-status="reviewed"]').first().click();
      cy.url().should('include', '/teacher/records/');
      
      // Should display full record details
      cy.get('[data-testid="record-details"]').should('be.visible');
      cy.get('[data-testid="resident-performance"]').should('be.visible');
      cy.get('[data-testid="teacher-evaluation"]').should('be.visible');
    });

    it('should display evaluation summary', () => {
      cy.get('[data-testid="record-item"][data-status="reviewed"]').first().click();
      
      // Check evaluation summary
      cy.get('[data-testid="overall-score"]').should('be.visible');
      cy.get('[data-testid="step-scores"]').should('be.visible');
      cy.get('[data-testid="osat-scores"]').should('be.visible');
      cy.get('[data-testid="teacher-feedback"]').should('be.visible');
    });

    it('should allow re-evaluation if needed', () => {
      cy.get('[data-testid="record-item"][data-status="reviewed"]').first().within(() => {
        cy.get('[data-testid="re-evaluate-button"]').click();
      });
      
      cy.url().should('include', '/teacher/review/');
      cy.get('[data-testid="review-form"]').should('be.visible');
      cy.get('[data-testid="re-evaluation-notice"]').should('be.visible');
    });
  });

  describe('Resident Performance Analytics', () => {
    beforeEach(() => {
      cy.visit('/teacher/dashboard');
    });

    it('should display resident performance metrics', () => {
      // Select a resident
      cy.get('[data-testid="resident-select"]').select('Test Resident');
      
      // Check performance metrics
      cy.get('[data-testid="performance-summary"]').should('be.visible');
      cy.get('[data-testid="average-score"]').should('be.visible');
      cy.get('[data-testid="improvement-trend"]').should('be.visible');
    });

    it('should show detailed performance breakdown', () => {
      cy.get('[data-testid="resident-select"]').select('Test Resident');
      
      // Check detailed metrics
      cy.get('[data-testid="surgery-type-performance"]').should('be.visible');
      cy.get('[data-testid="skill-area-breakdown"]').should('be.visible');
      cy.get('[data-testid="progress-over-time"]').should('be.visible');
    });

    it('should allow comparison between residents', () => {
      // Enable comparison mode
      cy.get('[data-testid="comparison-mode-toggle"]').click();
      
      // Select multiple residents
      cy.get('[data-testid="resident-select-1"]').select('Test Resident');
      cy.get('[data-testid="resident-select-2"]').select('Another Resident');
      
      // Check comparison charts
      cy.get('[data-testid="comparison-chart"]').should('be.visible');
      cy.get('[data-testid="performance-comparison"]').should('be.visible');
    });
  });

  describe('Navigation and User Experience', () => {
    it('should navigate between teacher sections', () => {
      // Test navigation menu
      cy.visit('/teacher/dashboard');
      cy.get('[data-testid="nav-records"]').click();
      cy.url().should('include', '/teacher/records');
      
      cy.get('[data-testid="nav-dashboard"]').click();
      cy.url().should('include', '/teacher/dashboard');
    });

    it('should display user information correctly', () => {
      cy.visit('/teacher/dashboard');
      
      // Check user info in header/navbar
      cy.get('[data-testid="user-name"]').should('contain.text', 'Test Teacher');
      cy.get('[data-testid="user-role"]').should('contain.text', 'Profesor');
    });

    it('should handle responsive design on mobile', () => {
      cy.setMobileViewport();
      cy.visit('/teacher/dashboard');
      
      // Check mobile navigation
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-nav-menu"]').should('be.visible');
    });
  });
});
