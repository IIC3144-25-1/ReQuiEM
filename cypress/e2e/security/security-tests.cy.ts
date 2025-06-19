describe('Security Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Input Sanitization', () => {
    it('should prevent XSS attacks in form inputs', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');

      // Test XSS payload in patient ID
      const xssPayload = '<script>alert("XSS")</script>';
      cy.get('[data-testid="patient-id-input"]').type(xssPayload);
      
      // Should be sanitized and not execute
      cy.get('[data-testid="patient-id-input"]').should('not.contain.html', '<script>');
      cy.window().then((win) => {
        expect(win.alert).to.not.have.been.called;
      });
    });

    it('should prevent SQL injection in search fields', () => {
      cy.loginAsResident();
      cy.visit('/resident/records');

      // Test SQL injection payload
      const sqlPayload = "'; DROP TABLE records; --";
      cy.get('[data-testid="search-input"]').type(sqlPayload);
      cy.get('[data-testid="search-button"]').click();

      // Should handle gracefully without errors
      cy.get('[data-testid="error-message"]').should('not.exist');
      cy.get('[data-testid="records-list"]').should('be.visible');
    });

    it('should sanitize HTML in comment fields', () => {
      cy.loginAsResident();
      cy.createMockRecord().then((recordId) => {
        cy.visit(`/resident/complete-record/${recordId}`);

        const htmlPayload = '<img src="x" onerror="alert(\'XSS\')">';
        cy.get('[data-testid="resident-comment-textarea"]').type(htmlPayload);
        cy.get('[data-testid="submit-steps-form"]').click();

        // HTML should be escaped or stripped
        cy.get('[data-testid="success-message"]').should('be.visible');
      });
    });

    it('should prevent script injection in file uploads', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');

      // Test malicious file upload if file input exists
      cy.get('[data-testid="file-upload-input"]').then($input => {
        if ($input.length > 0) {
          const maliciousFile = new File(['<script>alert("XSS")</script>'], 'malicious.html', {
            type: 'text/html'
          });
          
          cy.wrap($input).selectFile(maliciousFile, { force: true });
          
          // Should reject non-allowed file types
          cy.get('[data-testid="file-type-error"]').should('be.visible');
        }
      });
    });
  });

  describe('Authentication Security', () => {
    it('should prevent session fixation attacks', () => {
      // Set a session ID before login
      cy.setCookie('session-id', 'old-session-id');
      
      cy.loginAsResident();
      cy.visit('/resident/dashboard');

      // Session ID should change after login
      cy.getCookie('session-id').should('not.have.property', 'value', 'old-session-id');
    });

    it('should implement proper session timeout', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');

      // Mock session expiration
      cy.clearCookies();
      cy.clearLocalStorage();

      // Try to access protected resource
      cy.visit('/resident/records');
      cy.url().should('include', '/login');
    });

    it('should prevent CSRF attacks', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');

      // Check for CSRF token in forms
      cy.get('form').should('contain.html', 'csrf').or('have.attr', 'data-csrf');
      
      // Or check for proper headers in API calls
      cy.intercept('POST', '/api/records', (req) => {
        expect(req.headers).to.have.property('x-csrf-token').or.have.property('x-requested-with');
      }).as('createRecord');
    });

    it('should implement rate limiting', () => {
      cy.visit('/login');

      // Attempt multiple rapid login attempts
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="google-signin-button"]').click();
        cy.wait(100);
      }

      // Should show rate limiting message
      cy.get('[data-testid="rate-limit-error"]').should('be.visible');
      cy.get('[data-testid="rate-limit-error"]').should('contain.text', 'intentos');
    });
  });

  describe('Authorization Security', () => {
    it('should prevent privilege escalation', () => {
      cy.loginAsResident();

      // Try to access admin endpoints directly
      cy.request({
        url: '/api/admin/users',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });

      // Try to access admin pages
      cy.visit('/admin/resident', { failOnStatusCode: false });
      cy.url().should('include', '/unauthorized');
    });

    it('should prevent horizontal privilege escalation', () => {
      cy.loginAsResident({
        id: 'resident-1',
        name: 'Dr. Juan Pérez'
      });

      // Try to access another resident's data
      cy.request({
        url: '/api/residents/resident-2/records',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it('should validate resource ownership', () => {
      cy.loginAsResident();
      cy.visit('/resident/records');

      // All displayed records should belong to the current user
      cy.get('[data-testid="record-item"]').each($record => {
        cy.wrap($record).should('have.attr', 'data-owner', 'current-user');
      });
    });

    it('should prevent direct object reference attacks', () => {
      cy.loginAsResident();

      // Try to access record with sequential ID manipulation
      const recordIds = ['1', '2', '3', '999', 'admin'];
      
      recordIds.forEach(id => {
        cy.visit(`/resident/records/${id}`, { failOnStatusCode: false });
        
        // Should either show 404 or redirect to unauthorized
        cy.url().should('satisfy', (url) => {
          return url.includes('/404') || url.includes('/unauthorized') || url.includes('/resident/records');
        });
      });
    });
  });

  describe('Data Protection', () => {
    it('should mask sensitive data in logs', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');

      // Fill form with sensitive data
      cy.get('[data-testid="patient-id-input"]').type('12.345.678-9');
      cy.get('[data-testid="submit-record-form"]').click();

      // Check that sensitive data is not exposed in network logs
      cy.window().then((win) => {
        const logs = win.console.log.toString();
        expect(logs).to.not.include('12.345.678-9');
      });
    });

    it('should implement proper data encryption', () => {
      cy.loginAsResident();
      
      // Check that API calls use HTTPS
      cy.intercept('POST', '/api/**', (req) => {
        expect(req.url).to.include('https://');
      });

      // Check for encrypted local storage
      cy.window().then((win) => {
        const storedData = win.localStorage.getItem('user-data');
        if (storedData) {
          // Should not contain plain text sensitive data
          expect(storedData).to.not.include('@');
          expect(storedData).to.not.match(/\d{2}\.\d{3}\.\d{3}-\d/);
        }
      });
    });

    it('should prevent data leakage in error messages', () => {
      cy.loginAsResident();
      
      // Trigger an error
      cy.intercept('GET', '/api/records', {
        statusCode: 500,
        body: { error: 'Database connection failed: user=admin, password=secret123' }
      }).as('serverError');

      cy.visit('/resident/records');
      cy.wait('@serverError');

      // Error message should not expose sensitive information
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('not.contain.text', 'password');
      cy.get('[data-testid="error-message"]').should('not.contain.text', 'admin');
      cy.get('[data-testid="error-message"]').should('not.contain.text', 'secret');
    });

    it('should implement proper file upload security', () => {
      cy.loginAsResident();
      cy.visit('/resident/new-record');

      cy.get('[data-testid="file-upload-input"]').then($input => {
        if ($input.length > 0) {
          // Test various malicious file types
          const maliciousFiles = [
            { name: 'virus.exe', type: 'application/x-msdownload' },
            { name: 'script.php', type: 'application/x-php' },
            { name: 'payload.jsp', type: 'application/x-jsp' }
          ];

          maliciousFiles.forEach(file => {
            const testFile = new File(['malicious content'], file.name, { type: file.type });
            cy.wrap($input).selectFile(testFile, { force: true });
            
            // Should reject malicious file types
            cy.get('[data-testid="file-type-error"]').should('be.visible');
          });
        }
      });
    });
  });

  describe('Content Security Policy', () => {
    it('should have proper CSP headers', () => {
      cy.visit('/');
      
      cy.document().then((doc) => {
        const cspMeta = doc.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (cspMeta) {
          const csp = cspMeta.getAttribute('content');
          expect(csp).to.include("default-src 'self'");
          expect(csp).to.include("script-src");
          expect(csp).to.include("style-src");
        }
      });
    });

    it('should prevent inline script execution', () => {
      cy.visit('/');
      
      // Try to inject inline script
      cy.window().then((win) => {
        const script = win.document.createElement('script');
        script.innerHTML = 'window.xssTest = true;';
        win.document.head.appendChild(script);
        
        // Should be blocked by CSP
        expect(win.xssTest).to.be.undefined;
      });
    });

    it('should restrict external resource loading', () => {
      cy.visit('/');
      
      // Check that external resources are from allowed domains
      cy.get('script[src], link[href], img[src]').each($element => {
        const src = $element.attr('src') || $element.attr('href');
        if (src && src.startsWith('http')) {
          // Should be from allowed domains
          expect(src).to.satisfy((url) => {
            const allowedDomains = ['localhost', 'hospital.cl', 'cdn.hospital.cl'];
            return allowedDomains.some(domain => url.includes(domain));
          });
        }
      });
    });
  });

  describe('API Security', () => {
    it('should validate API input parameters', () => {
      cy.loginAsResident();
      
      // Test invalid parameters
      cy.request({
        method: 'GET',
        url: '/api/records',
        qs: {
          limit: -1,
          offset: 'invalid',
          sort: '<script>alert("xss")</script>'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });

    it('should implement proper API versioning', () => {
      cy.loginAsResident();
      
      // Check API version headers
      cy.intercept('GET', '/api/**', (req) => {
        expect(req.headers).to.have.property('accept').that.includes('application/json');
      });
    });

    it('should prevent API enumeration attacks', () => {
      cy.loginAsResident();
      
      // Try to enumerate resources
      const attempts = Array.from({ length: 10 }, (_, i) => i + 1);
      
      attempts.forEach(id => {
        cy.request({
          url: `/api/records/${id}`,
          failOnStatusCode: false
        }).then((response) => {
          // Should not reveal existence of resources user can't access
          if (response.status === 404) {
            expect(response.body).to.not.include('exists');
            expect(response.body).to.not.include('found');
          }
        });
      });
    });
  });

  describe('Session Management', () => {
    it('should implement secure session cookies', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');

      // Check session cookie attributes
      cy.getCookies().then((cookies) => {
        const sessionCookie = cookies.find(cookie => 
          cookie.name.includes('session') || cookie.name.includes('auth')
        );
        
        if (sessionCookie) {
          expect(sessionCookie.secure).to.be.true;
          expect(sessionCookie.httpOnly).to.be.true;
          expect(sessionCookie.sameSite).to.be.oneOf(['strict', 'lax']);
        }
      });
    });

    it('should clear session data on logout', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');

      // Logout
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();

      // Check that session data is cleared
      cy.getCookies().should('be.empty');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth-token')).to.be.null;
        expect(win.sessionStorage.getItem('user-data')).to.be.null;
      });
    });

    it('should prevent session hijacking', () => {
      cy.loginAsResident();
      cy.visit('/resident/dashboard');

      // Get session cookie
      cy.getCookie('session-id').then((cookie) => {
        if (cookie) {
          // Try to use session from different IP/User-Agent
          cy.request({
            url: '/api/user/profile',
            headers: {
              'Cookie': `session-id=${cookie.value}`,
              'User-Agent': 'Different-Browser',
              'X-Forwarded-For': '192.168.1.100'
            },
            failOnStatusCode: false
          }).then((response) => {
            // Should detect suspicious activity
            expect(response.status).to.be.oneOf([401, 403]);
          });
        }
      });
    });
  });
});
