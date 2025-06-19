describe('Admin Workflows', () => {
  beforeEach(() => {
    // Mock admin authentication
    cy.loginAsAdmin();
    cy.visit('/');
  });

  describe('Admin Dashboard Access', () => {
    it('should access admin dashboard and see admin menu', () => {
      cy.visit('/admin');
      cy.get('[data-testid="admin-dashboard"]').should('be.visible');
      
      // Check admin navigation menu
      cy.get('[data-testid="admin-menu"]').should('be.visible');
      cy.get('[data-testid="admin-menu"]').should('contain.text', 'Administrador');
    });

    it('should navigate to different admin sections', () => {
      cy.visit('/admin');
      
      // Test navigation to residents section
      cy.get('[data-testid="admin-residents-link"]').click();
      cy.url().should('include', '/admin/resident');
      
      // Test navigation to teachers section
      cy.visit('/admin');
      cy.get('[data-testid="admin-teachers-link"]').click();
      cy.url().should('include', '/admin/teacher');
      
      // Test navigation to surgeries section
      cy.visit('/admin');
      cy.get('[data-testid="admin-surgeries-link"]').click();
      cy.url().should('include', '/admin/surgeries');
      
      // Test navigation to areas section
      cy.visit('/admin');
      cy.get('[data-testid="admin-areas-link"]').click();
      cy.url().should('include', '/admin/areas');
    });
  });

  describe('Resident Management', () => {
    beforeEach(() => {
      cy.visit('/admin/resident');
    });

    it('should display residents list', () => {
      cy.get('[data-testid="residents-table"]').should('be.visible');
      cy.get('[data-testid="create-resident-button"]').should('be.visible');
    });

    it('should create a new resident', () => {
      cy.get('[data-testid="create-resident-button"]').click();
      cy.url().should('include', '/admin/resident/new');
      
      // Fill resident form
      cy.get('[data-testid="resident-form"]').should('be.visible');
      cy.get('[data-testid="resident-name-input"]').type('Dr. Juan Pérez');
      cy.get('[data-testid="resident-email-input"]').type('juan.perez@hospital.cl');
      cy.get('[data-testid="resident-rut-input"]').type('12.345.678-9');
      cy.get('[data-testid="resident-area-select"]').select('Cirugía General');
      
      // Submit form
      cy.get('[data-testid="submit-resident-form"]').click();
      
      // Verify success
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.url().should('include', '/admin/resident');
      
      // Verify resident appears in list
      cy.get('[data-testid="residents-table"]').should('contain.text', 'Dr. Juan Pérez');
    });

    it('should edit an existing resident', () => {
      // Assume there's at least one resident in the list
      cy.get('[data-testid="edit-resident-button"]').first().click();
      cy.url().should('include', '/admin/resident/edit/');
      
      // Edit resident information
      cy.get('[data-testid="resident-name-input"]').clear().type('Dr. Juan Carlos Pérez');
      cy.get('[data-testid="resident-phone-input"]').type('+56912345678');
      
      // Submit changes
      cy.get('[data-testid="submit-resident-form"]').click();
      
      // Verify success
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.url().should('include', '/admin/resident');
    });

    it('should delete a resident', () => {
      // Get initial count
      cy.get('[data-testid="residents-table"] tbody tr').then($rows => {
        const initialCount = $rows.length;
        
        // Delete first resident
        cy.get('[data-testid="delete-resident-button"]').first().click();
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        // Verify deletion
        cy.get('[data-testid="success-message"]').should('be.visible');
        cy.get('[data-testid="residents-table"] tbody tr').should('have.length', initialCount - 1);
      });
    });
  });

  describe('Teacher Management', () => {
    beforeEach(() => {
      cy.visit('/admin/teacher');
    });

    it('should display teachers list', () => {
      cy.get('[data-testid="teachers-table"]').should('be.visible');
      cy.get('[data-testid="create-teacher-button"]').should('be.visible');
    });

    it('should create a new teacher', () => {
      cy.get('[data-testid="create-teacher-button"]').click();
      cy.url().should('include', '/admin/teacher/new');
      
      // Fill teacher form
      cy.get('[data-testid="teacher-form"]').should('be.visible');
      cy.get('[data-testid="teacher-name-input"]').type('Dr. María González');
      cy.get('[data-testid="teacher-email-input"]').type('maria.gonzalez@hospital.cl');
      cy.get('[data-testid="teacher-rut-input"]').type('98.765.432-1');
      cy.get('[data-testid="teacher-area-select"]').select('Cardiología');
      
      // Submit form
      cy.get('[data-testid="submit-teacher-form"]').click();
      
      // Verify success
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.url().should('include', '/admin/teacher');
      
      // Verify teacher appears in list
      cy.get('[data-testid="teachers-table"]').should('contain.text', 'Dr. María González');
    });

    it('should edit an existing teacher', () => {
      cy.get('[data-testid="edit-teacher-button"]').first().click();
      cy.url().should('include', '/admin/teacher/edit/');
      
      // Edit teacher information
      cy.get('[data-testid="teacher-name-input"]').clear().type('Dr. María Elena González');
      
      // Submit changes
      cy.get('[data-testid="submit-teacher-form"]').click();
      
      // Verify success
      cy.get('[data-testid="success-message"]').should('be.visible');
    });
  });

  describe('Surgery Management', () => {
    beforeEach(() => {
      cy.visit('/admin/surgeries');
    });

    it('should display surgeries list', () => {
      cy.get('[data-testid="surgeries-table"]').should('be.visible');
      cy.get('[data-testid="create-surgery-button"]').should('be.visible');
    });

    it('should create a new surgery', () => {
      cy.get('[data-testid="create-surgery-button"]').click();
      cy.url().should('include', '/admin/surgeries/new');
      
      // Fill surgery form
      cy.get('[data-testid="surgery-form"]').should('be.visible');
      cy.get('[data-testid="surgery-name-input"]').type('Apendicectomía Laparoscópica');
      cy.get('[data-testid="surgery-description-input"]').type('Procedimiento mínimamente invasivo para extirpación del apéndice');
      cy.get('[data-testid="surgery-area-select"]').select('Cirugía General');
      
      // Add surgery steps
      cy.get('[data-testid="add-step-button"]').click();
      cy.get('[data-testid="step-input-0"]').type('Preparación del paciente');
      cy.get('[data-testid="add-step-button"]').click();
      cy.get('[data-testid="step-input-1"]').type('Inserción de trocares');
      cy.get('[data-testid="add-step-button"]').click();
      cy.get('[data-testid="step-input-2"]').type('Disección del apéndice');
      
      // Add OSAT evaluation criteria
      cy.get('[data-testid="osat-item-input-0"]').type('Técnica quirúrgica');
      cy.get('[data-testid="osat-scale-punctuation-0-0"]').type('1');
      cy.get('[data-testid="osat-scale-description-0-0"]').type('Deficiente');
      cy.get('[data-testid="add-osat-scale-button-0"]').click();
      cy.get('[data-testid="osat-scale-punctuation-0-1"]').type('5');
      cy.get('[data-testid="osat-scale-description-0-1"]').type('Excelente');
      
      // Submit form
      cy.get('[data-testid="submit-surgery-form"]').click();
      
      // Verify success
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.url().should('include', '/admin/surgeries');
      
      // Verify surgery appears in list
      cy.get('[data-testid="surgeries-table"]').should('contain.text', 'Apendicectomía Laparoscópica');
    });
  });

  describe('Area Management', () => {
    beforeEach(() => {
      cy.visit('/admin/areas');
    });

    it('should display areas list', () => {
      cy.get('[data-testid="areas-table"]').should('be.visible');
      cy.get('[data-testid="create-area-button"]').should('be.visible');
    });

    it('should create a new area', () => {
      cy.get('[data-testid="create-area-button"]').click();
      cy.url().should('include', '/admin/areas/new');
      
      // Fill area form
      cy.get('[data-testid="area-form"]').should('be.visible');
      cy.get('[data-testid="area-name-input"]').type('Neurocirugía');
      cy.get('[data-testid="area-description-input"]').type('Especialidad quirúrgica del sistema nervioso');
      
      // Submit form
      cy.get('[data-testid="submit-area-form"]').click();
      
      // Verify success
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.url().should('include', '/admin/areas');
      
      // Verify area appears in list
      cy.get('[data-testid="areas-table"]').should('contain.text', 'Neurocirugía');
    });
  });
});
