describe('Resident Workflow', () => {
  beforeEach(() => {
    cy.clearDatabase();
    cy.seedDatabase();
    cy.loginAsResident();
  });

  afterEach(() => {
    cy.clearDatabase();
  });

  describe('Dashboard', () => {
    it('should display resident dashboard with key metrics', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="dashboard-page"]').should('be.visible');
      
      // Check key metrics
      cy.get('[data-testid="total-surgeries"]').should('be.visible');
      cy.get('[data-testid="pending-reviews"]').should('be.visible');
      cy.get('[data-testid="completed-surgeries"]').should('be.visible');
      cy.get('[data-testid="progress-chart"]').should('be.visible');
    });

    it('should show recent surgery records', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="recent-records"]').should('be.visible');
      cy.get('[data-testid="record-item"]').should('have.length.at.least', 1);
    });

    it('should allow navigation to records from dashboard', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="view-all-records"]').click();
      cy.url().should('include', '/records');
    });

    it('should display upcoming surgeries', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="upcoming-surgeries"]').should('be.visible');
    });
  });

  describe('Surgery Record Creation', () => {
    beforeEach(() => {
      cy.visit('/records');
    });

    it('should create a new surgery record successfully', () => {
      cy.get('[data-testid="add-record-button"]').click();
      cy.get('[data-testid="record-form"]').should('be.visible');

      // Fill out the form
      cy.fillForm({
        surgery: 'Appendectomy',
        date: '2024-01-15',
        role: 'first_assistant',
        supervisor: 'Dr. Smith',
        notes: 'Successful procedure with no complications'
      });

      cy.get('[data-testid="submit-record"]').click();
      
      // Verify success
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.url().should('include', '/records');
      
      // Verify record appears in list
      cy.get('[data-testid="record-list"]').should('contain.text', 'Appendectomy');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="add-record-button"]').click();
      cy.get('[data-testid="submit-record"]').click();
      
      // Check validation errors
      cy.get('[data-testid="surgery-error"]').should('be.visible');
      cy.get('[data-testid="date-error"]').should('be.visible');
      cy.get('[data-testid="role-error"]').should('be.visible');
      cy.get('[data-testid="supervisor-error"]').should('be.visible');
    });

    it('should handle form cancellation', () => {
      cy.get('[data-testid="add-record-button"]').click();
      cy.get('[data-testid="cancel-record"]').click();
      
      cy.get('[data-testid="record-form"]').should('not.exist');
      cy.url().should('include', '/records');
    });

    it('should save draft automatically', () => {
      cy.get('[data-testid="add-record-button"]').click();
      
      cy.fillForm({
        surgery: 'Cholecystectomy',
        date: '2024-01-16'
      });

      // Navigate away and come back
      cy.visit('/dashboard');
      cy.visit('/records');
      cy.get('[data-testid="add-record-button"]').click();
      
      // Check if draft is restored
      cy.get('[data-testid="surgery-input"]').should('have.value', 'Cholecystectomy');
      cy.get('[data-testid="date-input"]').should('have.value', '2024-01-16');
    });

    it('should handle surgery search and selection', () => {
      cy.get('[data-testid="add-record-button"]').click();
      
      cy.get('[data-testid="surgery-search"]').type('Appen');
      cy.get('[data-testid="surgery-option"]').first().click();
      
      cy.get('[data-testid="surgery-input"]').should('have.value', 'Appendectomy');
      cy.get('[data-testid="surgery-details"]').should('be.visible');
    });
  });

  describe('Record Management', () => {
    beforeEach(() => {
      cy.visit('/records');
    });

    it('should display all surgery records', () => {
      cy.get('[data-testid="record-list"]').should('be.visible');
      cy.get('[data-testid="record-item"]').should('have.length.at.least', 1);
    });

    it('should filter records by status', () => {
      cy.get('[data-testid="status-filter"]').select('pending');
      cy.get('[data-testid="record-item"]').each($el => {
        cy.wrap($el).find('[data-testid="record-status"]').should('contain.text', 'Pending');
      });
    });

    it('should filter records by date range', () => {
      cy.get('[data-testid="date-from"]').type('2024-01-01');
      cy.get('[data-testid="date-to"]').type('2024-01-31');
      cy.get('[data-testid="apply-filter"]').click();
      
      cy.get('[data-testid="record-item"]').should('have.length.at.least', 1);
    });

    it('should search records by surgery name', () => {
      cy.get('[data-testid="search-input"]').type('Appendectomy');
      cy.get('[data-testid="record-item"]').should('contain.text', 'Appendectomy');
    });

    it('should view record details', () => {
      cy.get('[data-testid="record-item"]').first().click();
      cy.get('[data-testid="record-details"]').should('be.visible');
      cy.get('[data-testid="surgery-name"]').should('be.visible');
      cy.get('[data-testid="surgery-date"]').should('be.visible');
      cy.get('[data-testid="supervisor-name"]').should('be.visible');
    });

    it('should edit existing record', () => {
      cy.get('[data-testid="record-item"]').first().find('[data-testid="edit-record"]').click();
      cy.get('[data-testid="record-form"]').should('be.visible');
      
      cy.get('[data-testid="notes-input"]').clear().type('Updated notes');
      cy.get('[data-testid="submit-record"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
    });

    it('should delete record with confirmation', () => {
      cy.get('[data-testid="record-item"]').first().find('[data-testid="delete-record"]').click();
      cy.get('[data-testid="confirm-delete"]').should('be.visible');
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
    });

    it('should export records to PDF', () => {
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="export-pdf"]').click();
      
      // Verify download started
      cy.readFile('cypress/downloads/surgery-records.pdf').should('exist');
    });
  });

  describe('Progress Tracking', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('should display progress charts', () => {
      cy.get('[data-testid="progress-chart"]').should('be.visible');
      cy.get('[data-testid="surgery-distribution"]').should('be.visible');
      cy.get('[data-testid="monthly-progress"]').should('be.visible');
    });

    it('should show surgery requirements progress', () => {
      cy.get('[data-testid="requirements-progress"]').should('be.visible');
      cy.get('[data-testid="requirement-item"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid="requirement-item"]').first().within(() => {
        cy.get('[data-testid="requirement-name"]').should('be.visible');
        cy.get('[data-testid="progress-bar"]').should('be.visible');
        cy.get('[data-testid="completion-percentage"]').should('be.visible');
      });
    });

    it('should display competency levels', () => {
      cy.get('[data-testid="competency-levels"]').should('be.visible');
      cy.get('[data-testid="competency-item"]').should('have.length.at.least', 1);
    });
  });

  describe('Profile Management', () => {
    beforeEach(() => {
      cy.visit('/profile');
    });

    it('should display user profile information', () => {
      cy.get('[data-testid="profile-page"]').should('be.visible');
      cy.get('[data-testid="user-name"]').should('be.visible');
      cy.get('[data-testid="user-email"]').should('be.visible');
      cy.get('[data-testid="user-rut"]').should('be.visible');
      cy.get('[data-testid="residency-year"]').should('be.visible');
    });

    it('should update profile information', () => {
      cy.get('[data-testid="edit-profile"]').click();
      cy.get('[data-testid="profile-form"]').should('be.visible');
      
      cy.get('[data-testid="name-input"]').clear().type('Updated Name');
      cy.get('[data-testid="save-profile"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="user-name"]').should('contain.text', 'Updated Name');
    });

    it('should change password', () => {
      cy.get('[data-testid="change-password"]').click();
      cy.get('[data-testid="password-form"]').should('be.visible');
      
      cy.fillForm({
        currentPassword: 'currentpass',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      });
      
      cy.get('[data-testid="save-password"]').click();
      cy.get('[data-testid="success-message"]').should('be.visible');
    });

    it('should upload profile picture', () => {
      cy.get('[data-testid="upload-avatar"]').click();
      cy.uploadFile('[data-testid="file-input"]', 'avatar.jpg');
      cy.get('[data-testid="save-avatar"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="user-avatar"]').should('have.attr', 'src').and('include', 'avatar');
    });
  });

  describe('Notifications', () => {
    it('should display notifications', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="notifications"]').should('be.visible');
      cy.get('[data-testid="notification-item"]').should('have.length.at.least', 0);
    });

    it('should mark notifications as read', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="notification-item"]').first().click();
      cy.get('[data-testid="notification-item"]').first().should('not.have.class', 'unread');
    });

    it('should clear all notifications', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="clear-notifications"]').click();
      cy.get('[data-testid="notification-item"]').should('have.length', 0);
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.setMobileViewport();
    });

    it('should display mobile-friendly dashboard', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="mobile-dashboard"]').should('be.visible');
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
    });

    it('should handle mobile record creation', () => {
      cy.visit('/records');
      cy.get('[data-testid="mobile-add-button"]').click();
      cy.get('[data-testid="mobile-record-form"]').should('be.visible');
    });

    it('should navigate using mobile menu', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-nav-records"]').click();
      cy.url().should('include', '/records');
    });
  });

  describe('Offline Functionality', () => {
    it('should handle offline mode gracefully', () => {
      cy.visit('/dashboard');
      
      // Simulate offline
      cy.window().then(win => {
        win.navigator.onLine = false;
      });
      
      cy.get('[data-testid="offline-indicator"]').should('be.visible');
      cy.get('[data-testid="offline-message"]').should('contain.text', 'Sin conexión');
    });

    it('should sync data when back online', () => {
      // Create record while offline
      cy.window().then(win => {
        win.navigator.onLine = false;
      });
      
      cy.visit('/records');
      cy.get('[data-testid="add-record-button"]').click();
      cy.fillForm({
        surgery: 'Offline Surgery',
        date: '2024-01-20',
        role: 'observer'
      });
      cy.get('[data-testid="submit-record"]').click();
      
      // Go back online
      cy.window().then(win => {
        win.navigator.onLine = true;
      });
      
      cy.get('[data-testid="sync-indicator"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('be.visible');
    });
  });
});
