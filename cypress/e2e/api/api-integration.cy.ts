describe('API Integration Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Authentication API', () => {
    it('should handle OAuth flow correctly', () => {
      cy.visit('/login');

      // Mock OAuth callback
      cy.intercept('GET', '/api/auth/callback/google*', {
        statusCode: 200,
        body: {
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@hospital.cl',
            role: 'resident'
          },
          token: 'mock-jwt-token'
        }
      }).as('oauthCallback');

      cy.get('[data-testid="google-signin-button"]').click();
      
      // Should redirect to OAuth provider (mocked)
      cy.url().should('include', 'accounts.google.com').or('include', '/api/auth/signin');
    });

    it('should refresh tokens automatically', () => {
      cy.loginAsResident();
      
      // Mock token refresh
      cy.intercept('POST', '/api/auth/refresh', {
        statusCode: 200,
        body: {
          token: 'new-jwt-token',
          refreshToken: 'new-refresh-token'
        }
      }).as('tokenRefresh');

      // Mock expired token response
      cy.intercept('GET', '/api/user/profile', {
        statusCode: 401,
        body: { error: 'Token expired' }
      }).as('expiredToken');

      cy.visit('/resident/dashboard');
      cy.wait('@expiredToken');
      cy.wait('@tokenRefresh');

      // Should automatically retry with new token
      cy.get('[data-testid="resident-dashboard"]').should('be.visible');
    });

    it('should handle authentication errors gracefully', () => {
      cy.visit('/login');

      // Mock OAuth error
      cy.intercept('GET', '/api/auth/callback/google*', {
        statusCode: 400,
        body: { error: 'invalid_grant' }
      }).as('oauthError');

      cy.get('[data-testid="google-signin-button"]').click();
      cy.wait('@oauthError');

      // Should show user-friendly error message
      cy.get('[data-testid="auth-error-message"]').should('be.visible');
      cy.get('[data-testid="auth-error-message"]').should('contain.text', 'Error al iniciar sesión');
    });
  });

  describe('Records API', () => {
    beforeEach(() => {
      cy.loginAsResident();
    });

    it('should create records with proper validation', () => {
      cy.intercept('POST', '/api/records', (req) => {
        // Validate request structure
        expect(req.body).to.have.property('surgery');
        expect(req.body).to.have.property('teacher');
        expect(req.body).to.have.property('patientId');
        expect(req.body).to.have.property('date');
        expect(req.body).to.have.property('residentsYear');

        // Validate data types
        expect(req.body.residentsYear).to.be.a('number');
        expect(req.body.date).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

        req.reply({
          statusCode: 201,
          body: {
            id: 'new-record-123',
            ...req.body,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        });
      }).as('createRecord');

      cy.visit('/resident/new-record');
      
      // Fill and submit form
      cy.get('[data-testid="surgery-select"]').select('Apendicectomía Laparoscópica');
      cy.get('[data-testid="teacher-select"]').select('Dr. María González');
      cy.get('[data-testid="patient-id-input"]').type('12.345.678-9');
      cy.get('[data-testid="date-input"]').type('2024-01-15');
      cy.get('[data-testid="hour-select"]').select('14');
      cy.get('[data-testid="minute-select"]').select('30');
      cy.get('[data-testid="residents-year-select"]').select('3');
      
      cy.get('[data-testid="submit-record-form"]').click();
      cy.wait('@createRecord');

      // Should redirect to complete record
      cy.url().should('include', '/resident/complete-record/new-record-123');
    });

    it('should update records with optimistic locking', () => {
      cy.intercept('PUT', '/api/records/*', (req) => {
        // Check for version/etag header
        expect(req.headers).to.have.property('if-match');
        
        req.reply({
          statusCode: 200,
          body: {
            ...req.body,
            version: 2,
            updatedAt: new Date().toISOString()
          }
        });
      }).as('updateRecord');

      cy.createMockRecord().then((recordId) => {
        cy.visit(`/resident/complete-record/${recordId}`);
        
        cy.get('[data-testid="step-checkbox-0"]').check();
        cy.get('[data-testid="submit-steps-form"]').click();
        
        cy.wait('@updateRecord');
      });
    });

    it('should handle concurrent updates gracefully', () => {
      cy.intercept('PUT', '/api/records/*', {
        statusCode: 409,
        body: { 
          error: 'Conflict',
          message: 'Record was updated by another user'
        }
      }).as('conflictError');

      cy.createMockRecord().then((recordId) => {
        cy.visit(`/resident/complete-record/${recordId}`);
        
        cy.get('[data-testid="step-checkbox-0"]').check();
        cy.get('[data-testid="submit-steps-form"]').click();
        
        cy.wait('@conflictError');
        
        // Should show conflict resolution dialog
        cy.get('[data-testid="conflict-dialog"]').should('be.visible');
        cy.get('[data-testid="reload-button"]').should('be.visible');
      });
    });

    it('should implement proper pagination', () => {
      cy.intercept('GET', '/api/records*', (req) => {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        
        req.reply({
          statusCode: 200,
          body: {
            records: Array.from({ length: limit }, (_, i) => ({
              id: `record-${page}-${i}`,
              patientId: `12.345.${String(i).padStart(3, '0')}-9`,
              status: 'pending'
            })),
            pagination: {
              page,
              limit,
              total: 150,
              totalPages: Math.ceil(150 / limit)
            }
          }
        });
      }).as('getRecords');

      cy.visit('/resident/records');
      cy.wait('@getRecords');

      // Test pagination controls
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getRecords');
      
      cy.url().should('include', 'page=2');
    });

    it('should implement proper filtering and sorting', () => {
      cy.intercept('GET', '/api/records*', (req) => {
        const url = new URL(req.url);
        const status = url.searchParams.get('status');
        const sortBy = url.searchParams.get('sortBy');
        const sortOrder = url.searchParams.get('sortOrder');
        
        // Validate filter parameters
        if (status) {
          expect(['pending', 'corrected', 'reviewed', 'canceled']).to.include(status);
        }
        if (sortBy) {
          expect(['date', 'surgery', 'status']).to.include(sortBy);
        }
        if (sortOrder) {
          expect(['asc', 'desc']).to.include(sortOrder);
        }

        req.reply({
          statusCode: 200,
          body: {
            records: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
          }
        });
      }).as('getFilteredRecords');

      cy.visit('/resident/records');
      
      // Test filtering
      cy.get('[data-testid="status-filter"]').select('pending');
      cy.wait('@getFilteredRecords');
      
      // Test sorting
      cy.get('[data-testid="sort-select"]').select('date-desc');
      cy.wait('@getFilteredRecords');
    });
  });

  describe('User Management API', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should validate user creation data', () => {
      cy.intercept('POST', '/api/users', (req) => {
        // Validate required fields
        expect(req.body).to.have.property('name');
        expect(req.body).to.have.property('email');
        expect(req.body).to.have.property('role');
        expect(req.body).to.have.property('rut');

        // Validate email format
        expect(req.body.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        
        // Validate RUT format
        expect(req.body.rut).to.match(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/);
        
        // Validate role
        expect(['admin', 'teacher', 'resident']).to.include(req.body.role);

        req.reply({
          statusCode: 201,
          body: {
            id: 'user-123',
            ...req.body,
            createdAt: new Date().toISOString()
          }
        });
      }).as('createUser');

      cy.visit('/admin/resident/new');
      
      cy.get('[data-testid="resident-name-input"]').type('Dr. Test User');
      cy.get('[data-testid="resident-email-input"]').type('test@hospital.cl');
      cy.get('[data-testid="resident-rut-input"]').type('12.345.678-9');
      cy.get('[data-testid="resident-area-select"]').select('Cirugía General');
      
      cy.get('[data-testid="submit-resident-form"]').click();
      cy.wait('@createUser');
    });

    it('should handle duplicate user validation', () => {
      cy.intercept('POST', '/api/users', {
        statusCode: 409,
        body: {
          error: 'Conflict',
          message: 'User with this email already exists',
          field: 'email'
        }
      }).as('duplicateUser');

      cy.visit('/admin/resident/new');
      
      cy.get('[data-testid="resident-name-input"]').type('Dr. Duplicate User');
      cy.get('[data-testid="resident-email-input"]').type('existing@hospital.cl');
      cy.get('[data-testid="resident-rut-input"]').type('12.345.678-9');
      cy.get('[data-testid="resident-area-select"]').select('Cirugía General');
      
      cy.get('[data-testid="submit-resident-form"]').click();
      cy.wait('@duplicateUser');

      // Should show specific field error
      cy.get('[data-testid="email-error"]').should('be.visible');
      cy.get('[data-testid="email-error"]').should('contain.text', 'ya existe');
    });
  });

  describe('File Upload API', () => {
    beforeEach(() => {
      cy.loginAsResident();
    });

    it('should handle file uploads with proper validation', () => {
      cy.intercept('POST', '/api/upload', (req) => {
        // Validate file upload request
        expect(req.headers['content-type']).to.include('multipart/form-data');
        
        req.reply({
          statusCode: 200,
          body: {
            fileId: 'file-123',
            filename: 'document.pdf',
            size: 1024,
            url: '/uploads/file-123.pdf'
          }
        });
      }).as('uploadFile');

      cy.visit('/resident/new-record');
      
      cy.get('[data-testid="file-upload-input"]').then($input => {
        if ($input.length > 0) {
          const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
          cy.wrap($input).selectFile(file, { force: true });
          
          cy.wait('@uploadFile');
          
          // Should show upload success
          cy.get('[data-testid="upload-success"]').should('be.visible');
        }
      });
    });

    it('should handle file upload errors', () => {
      cy.intercept('POST', '/api/upload', {
        statusCode: 413,
        body: {
          error: 'File too large',
          maxSize: '5MB'
        }
      }).as('uploadError');

      cy.visit('/resident/new-record');
      
      cy.get('[data-testid="file-upload-input"]').then($input => {
        if ($input.length > 0) {
          const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.pdf', {
            type: 'application/pdf'
          });
          
          cy.wrap($input).selectFile(largeFile, { force: true });
          cy.wait('@uploadError');
          
          // Should show file size error
          cy.get('[data-testid="file-size-error"]').should('be.visible');
        }
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should handle WebSocket connections', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');

      // Mock WebSocket connection
      cy.window().then((win) => {
        const mockWs = {
          send: cy.stub(),
          close: cy.stub(),
          readyState: 1
        };
        
        // Simulate WebSocket message
        setTimeout(() => {
          const event = new MessageEvent('message', {
            data: JSON.stringify({
              type: 'RECORD_UPDATED',
              recordId: 'record-123',
              status: 'reviewed'
            })
          });
          win.dispatchEvent(event);
        }, 1000);
      });

      // Should update UI in real-time
      cy.get('[data-testid="notification"]').should('be.visible');
      cy.get('[data-testid="notification"]').should('contain.text', 'actualizado');
    });

    it('should handle connection failures gracefully', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');

      // Mock WebSocket connection failure
      cy.window().then((win) => {
        const errorEvent = new Event('error');
        win.dispatchEvent(errorEvent);
      });

      // Should show connection status
      cy.get('[data-testid="connection-status"]').should('contain.text', 'desconectado');
      cy.get('[data-testid="retry-connection"]').should('be.visible');
    });
  });

  describe('API Rate Limiting', () => {
    it('should handle rate limit responses', () => {
      cy.loginAsResident();
      
      cy.intercept('GET', '/api/records', {
        statusCode: 429,
        headers: {
          'Retry-After': '60'
        },
        body: {
          error: 'Too Many Requests',
          retryAfter: 60
        }
      }).as('rateLimited');

      cy.visit('/resident/records');
      cy.wait('@rateLimited');

      // Should show rate limit message
      cy.get('[data-testid="rate-limit-message"]').should('be.visible');
      cy.get('[data-testid="rate-limit-message"]').should('contain.text', '60 segundos');
    });

    it('should implement exponential backoff for retries', () => {
      cy.loginAsResident();
      
      let attemptCount = 0;
      cy.intercept('GET', '/api/records', (req) => {
        attemptCount++;
        if (attemptCount < 3) {
          req.reply({
            statusCode: 500,
            body: { error: 'Server Error' }
          });
        } else {
          req.reply({
            statusCode: 200,
            body: { records: [], pagination: {} }
          });
        }
      }).as('retryRequest');

      cy.visit('/resident/records');
      
      // Should eventually succeed after retries
      cy.get('[data-testid="records-list"]').should('be.visible');
    });
  });

  describe('API Versioning', () => {
    it('should handle API version compatibility', () => {
      cy.loginAsResident();
      
      cy.intercept('GET', '/api/v1/records', (req) => {
        expect(req.headers).to.have.property('accept');
        expect(req.headers.accept).to.include('application/vnd.api+json');
        
        req.reply({
          statusCode: 200,
          body: {
            apiVersion: '1.0',
            records: []
          }
        });
      }).as('apiV1');

      cy.visit('/resident/records');
      cy.wait('@apiV1');
    });

    it('should handle deprecated API warnings', () => {
      cy.loginAsResident();
      
      cy.intercept('GET', '/api/records', {
        statusCode: 200,
        headers: {
          'Deprecation': 'true',
          'Sunset': 'Sat, 31 Dec 2024 23:59:59 GMT'
        },
        body: {
          records: [],
          warnings: ['This API version is deprecated']
        }
      }).as('deprecatedApi');

      cy.visit('/resident/records');
      cy.wait('@deprecatedApi');

      // Should show deprecation warning
      cy.get('[data-testid="api-warning"]').should('be.visible');
    });
  });
});
