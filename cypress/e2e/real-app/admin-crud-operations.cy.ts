describe('Real Admin CRUD Operations - Testing Actual Forms and APIs', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Admin Authentication and Access', () => {
    it('should authenticate admin and access admin pages', () => {
      cy.loginAsAdmin();
      cy.visit('/admin/resident');
      
      // Check for actual admin page content
      cy.get('.container, .max-w-7xl').should('be.visible');
      cy.contains('Residentes').should('be.visible');
    });

    it('should prevent non-admin access to admin pages', () => {
      cy.loginAsResident();
      cy.visit('/admin/resident', { failOnStatusCode: false });
      
      // Should redirect or show unauthorized
      cy.url().should('not.include', '/admin/resident');
    });
  });

  describe('Real Surgery Management - SurgeryForm Component', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should create a new surgery using actual SurgeryForm', () => {
      cy.visit('/admin/surgeries/new');
      
      // Wait for form to load
      cy.get('form').should('be.visible');
      
      // Fill surgery name
      cy.get('input[name="name"]').type('Test Surgery - Cypress');
      
      // Fill description
      cy.get('input[name="description"]').type('Test surgery created by Cypress');
      
      // Select area
      cy.get('select[name="area"]').then($select => {
        if ($select.find('option').length > 1) {
          cy.wrap($select).select(1); // Select first available area
        }
      });
      
      // Add steps using the actual dynamic form
      cy.get('input[name="steps.0.name"]').type('Preparación del paciente');
      
      // Add another step
      cy.contains('Agregar paso').click();
      cy.get('input[name="steps.1.name"]').type('Incisión inicial');
      
      // Add OSAT evaluation
      cy.get('input[name="osats.0.item"]').type('Técnica quirúrgica');
      
      // Add OSAT scale
      cy.get('input[name="osats.0.scale.0.punctuation"]').type('1');
      cy.get('input[name="osats.0.scale.0.description"]').type('Deficiente');
      
      // Add another scale point
      cy.contains('Agregar escala').click();
      cy.get('input[name="osats.0.scale.1.punctuation"]').type('5');
      cy.get('input[name="osats.0.scale.1.description"]').type('Excelente');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to surgeries list
      cy.url().should('include', '/admin/surgeries');
      cy.contains('Test Surgery - Cypress').should('be.visible');
    });

    it('should edit an existing surgery', () => {
      cy.visit('/admin/surgeries');
      
      // Find edit button for first surgery
      cy.get('a[href*="/admin/surgeries/edit/"]').first().click();
      
      // Should load edit form
      cy.url().should('include', '/admin/surgeries/edit/');
      cy.get('form').should('be.visible');
      
      // Modify surgery name
      cy.get('input[name="name"]').clear().type('Updated Surgery Name');
      
      // Submit changes
      cy.get('button[type="submit"]').click();
      
      // Should redirect back to list
      cy.url().should('include', '/admin/surgeries');
      cy.contains('Updated Surgery Name').should('be.visible');
    });

    it('should validate surgery form fields', () => {
      cy.visit('/admin/surgeries/new');
      
      // Try to submit empty form
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.get('body').should('contain.text', 'requerido');
    });

    it('should delete a surgery', () => {
      cy.visit('/admin/surgeries');
      
      // Find delete button
      cy.get('button').contains('Eliminar').first().click();
      
      // Confirm deletion
      cy.get('button').contains('Confirmar').click();
      
      // Surgery should be removed from list
      cy.get('body').should('contain.text', 'eliminado');
    });
  });

  describe('Real Resident Management - ResidentForm Component', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should create a new resident using actual ResidentForm', () => {
      cy.visit('/admin/resident/new');
      
      // Wait for form to load
      cy.get('form').should('be.visible');
      
      // Fill user information
      cy.get('input[name="name"]').type('Dr. Test Resident');
      cy.get('input[name="email"]').type('test.resident@hospital.cl');
      cy.get('input[name="rut"]').type('19.876.543-2');
      cy.get('input[name="phone"]').type('+56912345678');
      
      // Select area
      cy.get('select[name="area"]').then($select => {
        if ($select.find('option').length > 1) {
          cy.wrap($select).select(1);
        }
      });
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to residents list
      cy.url().should('include', '/admin/resident');
      cy.contains('Dr. Test Resident').should('be.visible');
    });

    it('should edit an existing resident', () => {
      cy.visit('/admin/resident');
      
      // Find edit button
      cy.get('a[href*="/admin/resident/edit/"]').first().click();
      
      // Should load edit form
      cy.url().should('include', '/admin/resident/edit/');
      cy.get('form').should('be.visible');
      
      // Modify resident information
      cy.get('input[name="name"]').clear().type('Dr. Updated Resident');
      
      // Submit changes
      cy.get('button[type="submit"]').click();
      
      // Should redirect back to list
      cy.url().should('include', '/admin/resident');
      cy.contains('Dr. Updated Resident').should('be.visible');
    });

    it('should validate resident form fields', () => {
      cy.visit('/admin/resident/new');
      
      // Try to submit with invalid email
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      
      // Should show validation error
      cy.get('body').should('contain.text', 'email válido');
    });

    it('should delete a resident', () => {
      cy.visit('/admin/resident');
      
      // Find delete button
      cy.get('button').contains('Eliminar').first().click();
      
      // Confirm deletion
      cy.get('button').contains('Confirmar').click();
      
      // Resident should be removed
      cy.get('body').should('contain.text', 'eliminado');
    });
  });

  describe('Real Teacher Management - TeacherForm Component', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should create a new teacher using actual TeacherForm', () => {
      cy.visit('/admin/teacher/new');
      
      // Wait for form to load
      cy.get('form').should('be.visible');
      
      // Fill teacher information
      cy.get('input[name="name"]').type('Dr. Test Teacher');
      cy.get('input[name="email"]').type('test.teacher@hospital.cl');
      cy.get('input[name="rut"]').type('18.765.432-1');
      cy.get('input[name="phone"]').type('+56987654321');
      
      // Select area
      cy.get('select[name="area"]').then($select => {
        if ($select.find('option').length > 1) {
          cy.wrap($select).select(1);
        }
      });
      
      // Admin checkbox
      cy.get('input[name="admin"]').check();
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to teachers list
      cy.url().should('include', '/admin/teacher');
      cy.contains('Dr. Test Teacher').should('be.visible');
    });

    it('should edit an existing teacher', () => {
      cy.visit('/admin/teacher');
      
      // Find edit button
      cy.get('a[href*="/admin/teacher/edit/"]').first().click();
      
      // Should load edit form
      cy.url().should('include', '/admin/teacher/edit/');
      cy.get('form').should('be.visible');
      
      // Modify teacher information
      cy.get('input[name="name"]').clear().type('Dr. Updated Teacher');
      
      // Submit changes
      cy.get('button[type="submit"]').click();
      
      // Should redirect back to list
      cy.url().should('include', '/admin/teacher');
      cy.contains('Dr. Updated Teacher').should('be.visible');
    });
  });

  describe('Real Area Management - AreaForm Component', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should create a new area using actual AreaForm', () => {
      cy.visit('/admin/areas/new');
      
      // Wait for form to load
      cy.get('form').should('be.visible');
      
      // Fill area information
      cy.get('input[name="name"]').type('Test Area - Cypress');
      cy.get('input[name="description"]').type('Test area created by Cypress tests');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to areas list
      cy.url().should('include', '/admin/areas');
      cy.contains('Test Area - Cypress').should('be.visible');
    });

    it('should edit an existing area', () => {
      cy.visit('/admin/areas');
      
      // Find edit button
      cy.get('a[href*="/admin/areas/edit/"]').first().click();
      
      // Should load edit form
      cy.url().should('include', '/admin/areas/edit/');
      cy.get('form').should('be.visible');
      
      // Modify area information
      cy.get('input[name="name"]').clear().type('Updated Area Name');
      
      // Submit changes
      cy.get('button[type="submit"]').click();
      
      // Should redirect back to list
      cy.url().should('include', '/admin/areas');
      cy.contains('Updated Area Name').should('be.visible');
    });

    it('should validate area form fields', () => {
      cy.visit('/admin/areas/new');
      
      // Try to submit empty form
      cy.get('button[type="submit"]').click();
      
      // Should show validation error
      cy.get('body').should('contain.text', 'requerido');
    });
  });

  describe('Real Data Relationships and Integrity', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should maintain area-resident relationships', () => {
      // Create an area first
      cy.visit('/admin/areas/new');
      cy.get('input[name="name"]').type('Test Relationship Area');
      cy.get('button[type="submit"]').click();
      
      // Create a resident in that area
      cy.visit('/admin/resident/new');
      cy.get('input[name="name"]').type('Dr. Relationship Test');
      cy.get('input[name="email"]').type('relationship@hospital.cl');
      cy.get('select[name="area"]').select('Test Relationship Area');
      cy.get('button[type="submit"]').click();
      
      // Verify relationship
      cy.visit('/admin/areas');
      cy.contains('Test Relationship Area').click();
      cy.contains('Dr. Relationship Test').should('be.visible');
    });

    it('should prevent deletion of areas with associated users', () => {
      cy.visit('/admin/areas');
      
      // Try to delete area with residents
      cy.get('button').contains('Eliminar').first().click();
      
      // Should show warning or prevent deletion
      cy.get('body').should('contain.text', 'asociados');
    });

    it('should validate unique email constraints', () => {
      cy.visit('/admin/resident/new');
      
      // Try to create resident with existing email
      cy.get('input[name="email"]').type('existing@hospital.cl');
      cy.get('button[type="submit"]').click();
      
      // Should show duplicate error
      cy.get('body').should('contain.text', 'ya existe');
    });
  });

  describe('Real Error Handling and Network Issues', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should handle network errors during creation', () => {
      // Mock network error
      cy.intercept('POST', '/api/surgeries', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/admin/surgeries/new');
      cy.get('input[name="name"]').type('Test Surgery');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@networkError');
      
      // Should show error message
      cy.get('body').should('contain.text', 'error');
    });

    it('should handle server validation errors', () => {
      // Mock server validation error
      cy.intercept('POST', '/api/residents', {
        statusCode: 400,
        body: { error: 'Validation failed', field: 'email' }
      }).as('validationError');
      
      cy.visit('/admin/resident/new');
      cy.get('input[name="email"]').type('invalid@email');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@validationError');
      
      // Should show validation error
      cy.get('body').should('contain.text', 'error');
    });

    it('should handle session expiration during form submission', () => {
      cy.visit('/admin/surgeries/new');
      
      // Fill form
      cy.get('input[name="name"]').type('Test Surgery');
      
      // Clear session
      cy.clearCookies();
      
      // Try to submit
      cy.get('button[type="submit"]').click();
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });
  });

  describe('Real Pagination and Search', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should handle pagination in lists', () => {
      cy.visit('/admin/resident');
      
      // Check for pagination controls if many residents exist
      cy.get('body').then($body => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="pagination"]').should('be.visible');
          cy.get('[data-testid="next-page"]').click();
          cy.url().should('include', 'page=2');
        }
      });
    });

    it('should search and filter records', () => {
      cy.visit('/admin/resident');
      
      // Check for search functionality
      cy.get('body').then($body => {
        if ($body.find('input[type="search"]').length > 0) {
          cy.get('input[type="search"]').type('test');
          cy.get('button').contains('Buscar').click();
          
          // Results should be filtered
          cy.get('body').should('contain.text', 'test');
        }
      });
    });
  });
});
