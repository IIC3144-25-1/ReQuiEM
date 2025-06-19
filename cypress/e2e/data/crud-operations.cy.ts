describe('CRUD Operations Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Surgery Records CRUD', () => {
    beforeEach(() => {
      cy.loginAsResident();
    });

    it('should create a new surgery record', () => {
      cy.visit('/resident/new-record');
      
      // Create record
      cy.get('[data-testid="surgery-select"]').select('Apendicectomía Laparoscópica');
      cy.get('[data-testid="teacher-select"]').select('Dr. María González');
      cy.get('[data-testid="patient-id-input"]').type('12.345.678-9');
      
      const today = new Date().toISOString().split('T')[0];
      cy.get('[data-testid="date-input"]').type(today);
      cy.get('[data-testid="hour-select"]').select('14');
      cy.get('[data-testid="minute-select"]').select('30');
      cy.get('[data-testid="residents-year-select"]').select('3');
      
      cy.get('[data-testid="submit-record-form"]').click();
      
      // Verify creation
      cy.url().should('include', '/resident/complete-record/');
      cy.get('[data-testid="steps-form"]').should('be.visible');
    });

    it('should read and display surgery records', () => {
      cy.visit('/resident/records');
      
      // Verify records list is displayed
      cy.get('[data-testid="records-list"]').should('be.visible');
      cy.get('[data-testid="record-item"]').should('have.length.at.least', 1);
      
      // Verify record details
      cy.get('[data-testid="record-item"]').first().within(() => {
        cy.get('[data-testid="surgery-name"]').should('be.visible');
        cy.get('[data-testid="record-date"]').should('be.visible');
        cy.get('[data-testid="record-status"]').should('be.visible');
        cy.get('[data-testid="teacher-name"]').should('be.visible');
      });
    });

    it('should update surgery record steps', () => {
      cy.createMockRecord().then((recordId) => {
        cy.visit(`/resident/complete-record/${recordId}`);
        
        // Update steps
        cy.get('[data-testid="step-checkbox-0"]').check();
        cy.get('[data-testid="step-checkbox-1"]').check();
        cy.get('[data-testid="resident-judgment-slider"]').invoke('val', 8).trigger('input');
        cy.get('[data-testid="resident-comment-textarea"]').type('Procedimiento completado exitosamente');
        
        cy.get('[data-testid="submit-steps-form"]').click();
        
        // Verify update
        cy.get('[data-testid="success-message"]').should('be.visible');
        cy.url().should('include', '/resident/records');
      });
    });

    it('should delete surgery record (soft delete)', () => {
      cy.visit('/resident/records');
      
      // Get initial count
      cy.get('[data-testid="record-item"]').then($items => {
        const initialCount = $items.length;
        
        // Delete first record
        cy.get('[data-testid="record-item"]').first().within(() => {
          cy.get('[data-testid="delete-record-button"]').click();
        });
        
        cy.get('[data-testid="confirm-delete-modal"]').should('be.visible');
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        // Verify deletion
        cy.get('[data-testid="success-message"]').should('contain.text', 'eliminado');
        cy.get('[data-testid="record-item"]').should('have.length', initialCount - 1);
      });
    });

    it('should filter records by status', () => {
      cy.visit('/resident/records');
      
      // Test different status filters
      cy.get('[data-testid="status-filter"]').select('pending');
      cy.get('[data-testid="record-item"][data-status="pending"]').should('be.visible');
      cy.get('[data-testid="record-item"]:not([data-status="pending"])').should('not.exist');
      
      cy.get('[data-testid="status-filter"]').select('reviewed');
      cy.get('[data-testid="record-item"][data-status="reviewed"]').should('be.visible');
      cy.get('[data-testid="record-item"]:not([data-status="reviewed"])').should('not.exist');
      
      cy.get('[data-testid="status-filter"]').select('all');
      cy.get('[data-testid="record-item"]').should('have.length.at.least', 1);
    });

    it('should search records by patient ID', () => {
      cy.visit('/resident/records');
      
      // Search for specific patient
      cy.get('[data-testid="search-input"]').type('12.345.678-9');
      cy.get('[data-testid="search-button"]').click();
      
      // Verify search results
      cy.get('[data-testid="record-item"]').each($item => {
        cy.wrap($item).should('contain.text', '12.345.678-9');
      });
    });

    it('should sort records by date', () => {
      cy.visit('/resident/records');
      
      // Sort by date ascending
      cy.get('[data-testid="sort-select"]').select('date-asc');
      
      // Verify sorting
      cy.get('[data-testid="record-item"] [data-testid="record-date"]').then($dates => {
        const dates = Array.from($dates).map(el => new Date(el.textContent!));
        const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
        expect(dates).to.deep.equal(sortedDates);
      });
      
      // Sort by date descending
      cy.get('[data-testid="sort-select"]').select('date-desc');
      
      cy.get('[data-testid="record-item"] [data-testid="record-date"]').then($dates => {
        const dates = Array.from($dates).map(el => new Date(el.textContent!));
        const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime());
        expect(dates).to.deep.equal(sortedDates);
      });
    });
  });

  describe('Admin User Management CRUD', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    describe('Resident Management', () => {
      it('should create a new resident', () => {
        cy.visit('/admin/resident/new');
        
        // Fill form
        cy.get('[data-testid="resident-name-input"]').type('Dr. Test Resident');
        cy.get('[data-testid="resident-email-input"]').type('test.resident@hospital.cl');
        cy.get('[data-testid="resident-rut-input"]').type('19.876.543-2');
        cy.get('[data-testid="resident-area-select"]').select('Cirugía General');
        cy.get('[data-testid="resident-phone-input"]').type('+56912345678');
        
        cy.get('[data-testid="submit-resident-form"]').click();
        
        // Verify creation
        cy.get('[data-testid="success-message"]').should('be.visible');
        cy.url().should('include', '/admin/resident');
        
        // Verify in list
        cy.get('[data-testid="residents-table"]').should('contain.text', 'Dr. Test Resident');
      });

      it('should edit an existing resident', () => {
        cy.visit('/admin/resident');
        
        // Edit first resident
        cy.get('[data-testid="edit-resident-button"]').first().click();
        
        // Update information
        cy.get('[data-testid="resident-name-input"]').clear().type('Dr. Updated Resident');
        cy.get('[data-testid="resident-phone-input"]').clear().type('+56987654321');
        
        cy.get('[data-testid="submit-resident-form"]').click();
        
        // Verify update
        cy.get('[data-testid="success-message"]').should('be.visible');
        cy.get('[data-testid="residents-table"]').should('contain.text', 'Dr. Updated Resident');
      });

      it('should delete a resident', () => {
        cy.visit('/admin/resident');
        
        // Get initial count
        cy.get('[data-testid="residents-table"] tbody tr').then($rows => {
          const initialCount = $rows.length;
          
          // Delete first resident
          cy.get('[data-testid="delete-resident-button"]').first().click();
          cy.get('[data-testid="confirm-delete-modal"]').should('be.visible');
          cy.get('[data-testid="confirm-delete-button"]').click();
          
          // Verify deletion
          cy.get('[data-testid="success-message"]').should('be.visible');
          cy.get('[data-testid="residents-table"] tbody tr').should('have.length', initialCount - 1);
        });
      });

      it('should search residents by name', () => {
        cy.visit('/admin/resident');
        
        cy.get('[data-testid="search-residents-input"]').type('Dr. Test');
        cy.get('[data-testid="search-residents-button"]').click();
        
        cy.get('[data-testid="residents-table"] tbody tr').each($row => {
          cy.wrap($row).should('contain.text', 'Dr. Test');
        });
      });

      it('should filter residents by area', () => {
        cy.visit('/admin/resident');
        
        cy.get('[data-testid="area-filter-select"]').select('Cirugía General');
        
        cy.get('[data-testid="residents-table"] tbody tr').each($row => {
          cy.wrap($row).should('contain.text', 'Cirugía General');
        });
      });
    });

    describe('Surgery Management', () => {
      it('should create a new surgery', () => {
        cy.visit('/admin/surgeries/new');
        
        // Fill basic info
        cy.get('[data-testid="surgery-name-input"]').type('Test Surgery');
        cy.get('[data-testid="surgery-description-input"]').type('Test surgery description');
        cy.get('[data-testid="surgery-area-select"]').select('Cirugía General');
        
        // Add steps
        cy.get('[data-testid="step-input-0"]').type('Preparación');
        cy.get('[data-testid="add-step-button"]').click();
        cy.get('[data-testid="step-input-1"]').type('Incisión');
        cy.get('[data-testid="add-step-button"]').click();
        cy.get('[data-testid="step-input-2"]').type('Cierre');
        
        // Add OSAT criteria
        cy.get('[data-testid="osat-item-input-0"]').type('Técnica quirúrgica');
        cy.get('[data-testid="osat-scale-punctuation-0-0"]').type('1');
        cy.get('[data-testid="osat-scale-description-0-0"]').type('Deficiente');
        cy.get('[data-testid="add-osat-scale-button-0"]').click();
        cy.get('[data-testid="osat-scale-punctuation-0-1"]').type('5');
        cy.get('[data-testid="osat-scale-description-0-1"]').type('Excelente');
        
        cy.get('[data-testid="submit-surgery-form"]').click();
        
        // Verify creation
        cy.get('[data-testid="success-message"]').should('be.visible');
        cy.url().should('include', '/admin/surgeries');
        cy.get('[data-testid="surgeries-table"]').should('contain.text', 'Test Surgery');
      });

      it('should edit an existing surgery', () => {
        cy.visit('/admin/surgeries');
        
        cy.get('[data-testid="edit-surgery-button"]').first().click();
        
        // Update surgery
        cy.get('[data-testid="surgery-name-input"]').clear().type('Updated Surgery');
        cy.get('[data-testid="surgery-description-input"]').clear().type('Updated description');
        
        cy.get('[data-testid="submit-surgery-form"]').click();
        
        // Verify update
        cy.get('[data-testid="success-message"]').should('be.visible');
        cy.get('[data-testid="surgeries-table"]').should('contain.text', 'Updated Surgery');
      });

      it('should manage surgery steps dynamically', () => {
        cy.visit('/admin/surgeries/new');
        
        // Add multiple steps
        cy.get('[data-testid="step-input-0"]').type('Step 1');
        cy.get('[data-testid="add-step-button"]').click();
        cy.get('[data-testid="step-input-1"]').type('Step 2');
        cy.get('[data-testid="add-step-button"]').click();
        cy.get('[data-testid="step-input-2"]').type('Step 3');
        
        // Remove middle step
        cy.get('[data-testid="remove-step-button-1"]').click();
        
        // Verify step removal
        cy.get('[data-testid="step-input-1"]').should('have.value', 'Step 3');
        cy.get('[data-testid="step-input-2"]').should('not.exist');
      });
    });

    describe('Area Management', () => {
      it('should create a new area', () => {
        cy.visit('/admin/areas/new');
        
        cy.get('[data-testid="area-name-input"]').type('Test Area');
        cy.get('[data-testid="area-description-input"]').type('Test area description');
        
        cy.get('[data-testid="submit-area-form"]').click();
        
        cy.get('[data-testid="success-message"]').should('be.visible');
        cy.url().should('include', '/admin/areas');
        cy.get('[data-testid="areas-table"]').should('contain.text', 'Test Area');
      });

      it('should show area statistics', () => {
        cy.visit('/admin/areas');
        
        cy.get('[data-testid="area-item"]').first().within(() => {
          cy.get('[data-testid="area-residents-count"]').should('be.visible');
          cy.get('[data-testid="area-teachers-count"]').should('be.visible');
          cy.get('[data-testid="area-surgeries-count"]').should('be.visible');
        });
      });
    });
  });

  describe('Data Integrity and Relationships', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should maintain referential integrity when deleting areas', () => {
      cy.visit('/admin/areas');
      
      // Try to delete area with associated residents
      cy.get('[data-testid="delete-area-button"]').first().click();
      cy.get('[data-testid="confirm-delete-modal"]').should('be.visible');
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      // Should show warning about associated data
      cy.get('[data-testid="warning-message"]').should('be.visible');
      cy.get('[data-testid="warning-message"]').should('contain.text', 'residentes asociados');
    });

    it('should cascade updates when changing area assignments', () => {
      cy.visit('/admin/resident');
      
      // Change resident's area
      cy.get('[data-testid="edit-resident-button"]').first().click();
      cy.get('[data-testid="resident-area-select"]').select('Cardiología');
      cy.get('[data-testid="submit-resident-form"]').click();
      
      // Verify area statistics updated
      cy.visit('/admin/areas');
      cy.get('[data-testid="area-item"][data-area="Cardiología"]').within(() => {
        cy.get('[data-testid="area-residents-count"]').should('contain.text', '1');
      });
    });

    it('should validate unique constraints', () => {
      cy.visit('/admin/resident/new');
      
      // Try to create resident with existing email
      cy.get('[data-testid="resident-name-input"]').type('Duplicate Resident');
      cy.get('[data-testid="resident-email-input"]').type('existing@hospital.cl');
      cy.get('[data-testid="resident-rut-input"]').type('12.345.678-9');
      cy.get('[data-testid="resident-area-select"]').select('Cirugía General');
      
      cy.get('[data-testid="submit-resident-form"]').click();
      
      // Should show duplicate error
      cy.get('[data-testid="email-error"]').should('be.visible');
      cy.get('[data-testid="email-error"]').should('contain.text', 'ya existe');
    });
  });
});
