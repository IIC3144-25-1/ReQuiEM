describe("Resident Workflows - Real Application Tests", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe("Resident Dashboard Access", () => {
    it("should access resident dashboard", () => {
      cy.visit("/resident/dashboard");
      cy.get('[data-testid="resident-dashboard"]').should("be.visible");
      cy.get('[data-testid="dashboard-title"]').should(
        "contain.text",
        "Dashboard"
      );
    });

    it("should display resident statistics and charts", () => {
      cy.visit("/resident/dashboard");

      // Check for charts and statistics
      cy.get('[data-testid="records-completed-chart"]').should("be.visible");
      cy.get('[data-testid="surgery-types-chart"]').should("be.visible");
      cy.get('[data-testid="steps-completed-chart"]').should("be.visible");
    });

    it("should navigate to records from dashboard", () => {
      cy.visit("/resident/dashboard");
      cy.get('[data-testid="view-records-button"]').click();
      cy.url().should("include", "/resident/records");
    });
  });

  describe("Surgery Record Creation", () => {
    beforeEach(() => {
      cy.visit("/resident/new-record");
    });

    it("should display new record form", () => {
      cy.get('[data-testid="record-form"]').should("be.visible");
      cy.get('[data-testid="surgery-select"]').should("be.visible");
      cy.get('[data-testid="teacher-select"]').should("be.visible");
      cy.get('[data-testid="patient-id-input"]').should("be.visible");
      cy.get('[data-testid="date-input"]').should("be.visible");
      cy.get('[data-testid="residents-year-select"]').should("be.visible");
    });

    it("should create a new surgery record successfully", () => {
      // Fill out the record form
      cy.get('[data-testid="surgery-select"]').select(
        "Apendicectomía Laparoscópica"
      );
      cy.get('[data-testid="teacher-select"]').select("Dr. María González");
      cy.get('[data-testid="patient-id-input"]').type("12.345.678-9");

      // Set date and time
      const today = new Date();
      const dateString = today.toISOString().split("T")[0];
      cy.get('[data-testid="date-input"]').type(dateString);
      cy.get('[data-testid="hour-select"]').select("14");
      cy.get('[data-testid="minute-select"]').select("30");

      cy.get('[data-testid="residents-year-select"]').select("3");

      // Submit form
      cy.get('[data-testid="submit-record-form"]').click();

      // Should redirect to complete record page
      cy.url().should("include", "/resident/complete-record/");
      cy.get('[data-testid="steps-form"]').should("be.visible");
    });

    it("should validate required fields", () => {
      // Try to submit without filling required fields
      cy.get('[data-testid="submit-record-form"]').click();

      // Should show validation errors
      cy.get('[data-testid="surgery-error"]').should("be.visible");
      cy.get('[data-testid="teacher-error"]').should("be.visible");
      cy.get('[data-testid="patient-id-error"]').should("be.visible");
    });
  });

  describe("Completing Surgery Records", () => {
    beforeEach(() => {
      // Create a record first, then navigate to complete it
      cy.createMockRecord().then((recordId) => {
        cy.visit(`/resident/complete-record/${recordId}`);
      });
    });

    it("should display steps completion form", () => {
      cy.get('[data-testid="steps-form"]').should("be.visible");
      cy.get('[data-testid="surgery-steps"]').should("be.visible");
      cy.get('[data-testid="resident-judgment-slider"]').should("be.visible");
      cy.get('[data-testid="resident-comment-textarea"]').should("be.visible");
    });

    it("should complete surgery steps and submit", () => {
      // Mark steps as completed
      cy.get('[data-testid="step-checkbox-0"]').check();
      cy.get('[data-testid="step-checkbox-1"]').check();
      cy.get('[data-testid="step-checkbox-2"]').check();

      // Set self-assessment judgment
      cy.get('[data-testid="resident-judgment-slider"]')
        .invoke("val", 8)
        .trigger("input");

      // Add comment
      cy.get('[data-testid="resident-comment-textarea"]').type(
        "Procedimiento realizado sin complicaciones. Buena técnica laparoscópica aplicada."
      );

      // Submit completion
      cy.get('[data-testid="submit-steps-form"]').click();

      // Should redirect to records list
      cy.url().should("include", "/resident/records");
      cy.get('[data-testid="success-message"]').should(
        "contain.text",
        "Registro completado exitosamente"
      );
    });

    it("should save progress without completing all steps", () => {
      // Mark only some steps as completed
      cy.get('[data-testid="step-checkbox-0"]').check();
      cy.get('[data-testid="step-checkbox-1"]').check();

      // Set partial judgment
      cy.get('[data-testid="resident-judgment-slider"]')
        .invoke("val", 6)
        .trigger("input");

      // Save as draft
      cy.get('[data-testid="save-draft-button"]').click();

      // Should show save confirmation
      cy.get('[data-testid="draft-saved-message"]').should("be.visible");
    });
  });

  describe("Viewing Surgery Records", () => {
    beforeEach(() => {
      cy.visit("/resident/records");
    });

    it("should display records list", () => {
      cy.get('[data-testid="records-list"]').should("be.visible");
      cy.get('[data-testid="new-record-button"]').should("be.visible");
    });

    it("should filter records by status", () => {
      // Test status filters
      cy.get('[data-testid="status-filter"]').select("pending");
      cy.get('[data-testid="records-list"] [data-status="pending"]').should(
        "be.visible"
      );

      cy.get('[data-testid="status-filter"]').select("reviewed");
      cy.get('[data-testid="records-list"] [data-status="reviewed"]').should(
        "be.visible"
      );
    });

    it("should view individual record details", () => {
      // Click on first record
      cy.get('[data-testid="record-item"]').first().click();
      cy.url().should("include", "/resident/records/");

      // Should display record details
      cy.get('[data-testid="record-details"]').should("be.visible");
      cy.get('[data-testid="surgery-name"]').should("be.visible");
      cy.get('[data-testid="teacher-name"]').should("be.visible");
      cy.get('[data-testid="record-date"]').should("be.visible");
      cy.get('[data-testid="record-status"]').should("be.visible");
    });

    it("should display feedback when available", () => {
      // Navigate to a reviewed record
      cy.get('[data-testid="record-item"][data-status="reviewed"]')
        .first()
        .click();

      // Should show teacher feedback
      cy.get('[data-testid="teacher-feedback"]').should("be.visible");
      cy.get('[data-testid="teacher-judgment"]').should("be.visible");
      cy.get('[data-testid="osat-scores"]').should("be.visible");
    });
  });

  describe("Record Status Management", () => {
    it("should show different record statuses correctly", () => {
      cy.visit("/resident/records");

      // Check for different status indicators
      cy.get('[data-testid="record-item"][data-status="pending"]').should(
        "contain.text",
        "Pendiente"
      );

      cy.get('[data-testid="record-item"][data-status="corrected"]').should(
        "contain.text",
        "Corregido"
      );

      cy.get('[data-testid="record-item"][data-status="reviewed"]').should(
        "contain.text",
        "Revisado"
      );
    });

    it("should allow editing pending records", () => {
      cy.visit("/resident/records");

      // Find a pending record and edit it
      cy.get('[data-testid="record-item"][data-status="pending"]')
        .first()
        .within(() => {
          cy.get('[data-testid="edit-record-button"]').click();
        });

      cy.url().should("include", "/resident/complete-record/");
      cy.get('[data-testid="steps-form"]').should("be.visible");
    });

    it("should not allow editing reviewed records", () => {
      cy.visit("/resident/records");

      // Reviewed records should not have edit button
      cy.get('[data-testid="record-item"][data-status="reviewed"]')
        .first()
        .within(() => {
          cy.get('[data-testid="edit-record-button"]').should("not.exist");
        });
    });
  });

  describe("Navigation and User Experience", () => {
    it("should navigate between resident sections", () => {
      // Test navigation menu
      cy.visit("/resident/dashboard");
      cy.get('[data-testid="nav-records"]').click();
      cy.url().should("include", "/resident/records");

      cy.get('[data-testid="nav-new-record"]').click();
      cy.url().should("include", "/resident/new-record");

      cy.get('[data-testid="nav-dashboard"]').click();
      cy.url().should("include", "/resident/dashboard");
    });

    it("should display user information correctly", () => {
      cy.visit("/resident/dashboard");

      // Check user info in header/navbar
      cy.get('[data-testid="user-name"]').should(
        "contain.text",
        "Test Resident"
      );
      cy.get('[data-testid="user-role"]').should("contain.text", "Residente");
    });

    it("should handle responsive design on mobile", () => {
      cy.setMobileViewport();
      cy.visit("/resident/dashboard");

      // Check mobile navigation
      cy.get('[data-testid="mobile-menu-button"]').should("be.visible");
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-nav-menu"]').should("be.visible");
    });
  });
});
