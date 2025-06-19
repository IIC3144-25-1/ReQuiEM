# Testing Guide for ReQuiEM

This document provides comprehensive information about the testing suite for the ReQuiEM application.

## Overview

Our testing strategy follows industry best practices with multiple layers of testing:

- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test interactions between different parts of the system
- **End-to-End (E2E) Tests**: Test complete user workflows
- **Component Tests**: Test React components with proper mocking

## Testing Stack

- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **Cypress**: End-to-end testing framework
- **MongoDB Memory Server**: In-memory MongoDB for testing
- **MSW (Mock Service Worker)**: API mocking for tests

## Project Structure

```
__tests__/
├── components/          # Component tests
├── actions/            # Server action tests
├── models/             # Database model tests
├── utils/              # Utility function tests
├── integration/        # Integration tests
└── utils/
    ├── test-utils.tsx  # Testing utilities and helpers
    └── db-utils.ts     # Database testing utilities

cypress/
├── e2e/               # End-to-end tests
├── component/         # Component tests (Cypress)
├── fixtures/          # Test data
└── support/           # Cypress configuration and commands
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only component tests
npm run test:components

# Run tests for CI
npm run test:ci
```

### End-to-End Tests

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run E2E tests headlessly
npm run cypress:run

# Run E2E tests with server
npm run test:e2e

# Open E2E tests with server
npm run test:e2e:open
```

### All Tests

```bash
# Run all tests (unit + E2E)
npm run test:all
```

## Writing Tests

### Unit Tests

#### Testing Components

```typescript
import { render, screen } from '../utils/test-utils';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />, { session: mockSession });
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

#### Testing Server Actions

```typescript
import { myAction } from '@/actions/my-action';
import { setupTestDB, teardownTestDB, clearTestDB } from '../utils/db-utils';

describe('myAction', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  it('should perform action correctly', async () => {
    const result = await myAction(testData);
    expect(result.success).toBe(true);
  });
});
```

#### Testing Database Models

```typescript
import { User } from '@/models/User';
import { setupTestDB, teardownTestDB, clearTestDB } from '../utils/db-utils';

describe('User Model', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  it('should create user with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      role: 'resident',
      rut: '12.345.678-5',
    };

    const user = await User.create(userData);
    expect(user.name).toBe(userData.name);
  });
});
```

### E2E Tests

#### Basic E2E Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.clearDatabase();
    cy.seedDatabase();
  });

  afterEach(() => {
    cy.clearDatabase();
  });

  it('should complete user workflow', () => {
    cy.loginAsResident();
    cy.visit('/dashboard');
    
    cy.get('[data-testid="dashboard-page"]').should('be.visible');
    cy.get('[data-testid="user-greeting"]').should('contain.text', 'Test Resident');
  });
});
```

## Test Data and Mocking

### Mock Data Factories

Use the provided factory functions for consistent test data:

```typescript
import { 
  createMockUser, 
  createMockResident, 
  createMockSurgery 
} from '../utils/test-utils';

const mockUser = createMockUser({ role: 'teacher' });
const mockResident = createMockResident({ year: 2 });
```

### Database Seeding

```typescript
// Seed database with test data
await seedTestData();

// Create specific test records
await createTestRecord({ status: 'approved' });
```

### API Mocking

```typescript
// Mock API responses
mockFetch({ success: true, data: mockData });

// Mock specific endpoints
cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers');
```

## Custom Testing Utilities

### React Testing Library Extensions

```typescript
// Custom render with providers
render(<Component />, { session: mockSession });

// Form helpers
await fillForm(form, { name: 'John', email: 'john@example.com' });

// Wait utilities
await waitForLoadingToFinish();
```

### Cypress Custom Commands

```typescript
// Authentication
cy.loginAsResident();
cy.loginAsTeacher();
cy.loginAsAdmin();
cy.logout();

// Database operations
cy.seedDatabase();
cy.clearDatabase();

// Form operations
cy.fillForm({ field1: 'value1', field2: 'value2' });
cy.submitForm();

// Viewport management
cy.setMobileViewport();
cy.setTabletViewport();
cy.setDesktopViewport();
```

## Coverage Requirements

We maintain high test coverage standards:

- **Statements**: 70% minimum
- **Branches**: 70% minimum
- **Functions**: 70% minimum
- **Lines**: 70% minimum

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open coverage report in browser
open coverage/lcov-report/index.html
```

## Continuous Integration

Our CI pipeline runs:

1. **Linting**: Code style and quality checks
2. **Type Checking**: TypeScript compilation
3. **Unit Tests**: All Jest tests with coverage
4. **Integration Tests**: Database integration tests
5. **E2E Tests**: Full user workflow tests
6. **Security Scan**: Dependency vulnerability checks
7. **Build Test**: Production build verification

## Best Practices

### General Testing Principles

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Write Descriptive Test Names**: Test names should clearly describe what is being tested
3. **Arrange, Act, Assert**: Structure tests with clear setup, execution, and verification phases
4. **Keep Tests Independent**: Each test should be able to run in isolation
5. **Use Data-Testid Attributes**: Prefer `data-testid` over class names or text content for element selection

### Component Testing

1. **Test User Interactions**: Focus on how users interact with components
2. **Mock External Dependencies**: Mock API calls, external services, and complex dependencies
3. **Test Different States**: Test loading, error, and success states
4. **Test Accessibility**: Ensure components are accessible and keyboard navigable

### E2E Testing

1. **Test Critical User Paths**: Focus on the most important user workflows
2. **Use Page Object Pattern**: Organize selectors and actions into reusable page objects
3. **Handle Async Operations**: Properly wait for elements and API calls
4. **Test Across Browsers**: Ensure compatibility across different browsers
5. **Keep Tests Stable**: Use reliable selectors and handle flaky tests

### Database Testing

1. **Use Test Database**: Always use a separate database for testing
2. **Clean Up After Tests**: Reset database state between tests
3. **Test Data Integrity**: Verify that data is stored and retrieved correctly
4. **Test Constraints**: Ensure database constraints are properly enforced

## Debugging Tests

### Jest Tests

```bash
# Run specific test file
npm test -- MyComponent.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Cypress Tests

```bash
# Open Cypress with debugging
npm run cypress:open

# Run specific test file
npx cypress run --spec "cypress/e2e/auth/authentication.cy.ts"

# Debug mode
npx cypress run --headed --no-exit
```

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout values or improve async handling
2. **Database connection issues**: Ensure MongoDB is running and accessible
3. **Mock not working**: Verify mock setup and import order
4. **Flaky E2E tests**: Add proper waits and improve element selection

### Getting Help

1. Check the test output for specific error messages
2. Review the testing utilities and helper functions
3. Look at existing tests for similar patterns
4. Check the Jest and Cypress documentation
5. Ask the team for help with complex testing scenarios

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass before submitting PR
3. Maintain or improve test coverage
4. Update this documentation if adding new testing patterns
5. Add appropriate test data and fixtures

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
