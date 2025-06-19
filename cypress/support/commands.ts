// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      // Viewport commands
      setMobileViewport(): Chainable<void>;
      setTabletViewport(): Chainable<void>;
      setDesktopViewport(): Chainable<void>;

      // Database commands
      seedDatabase(): Chainable<void>;
      clearDatabase(): Chainable<void>;

      // Authentication commands
      loginAsResident(userData?: Record<string, any>): Chainable<void>;
      loginAsTeacher(userData?: Record<string, any>): Chainable<void>;
      loginAsAdmin(userData?: Record<string, any>): Chainable<void>;
      logout(): Chainable<void>;

      // Form commands
      fillForm(formData: Record<string, string>): Chainable<void>;
      submitForm(formSelector?: string): Chainable<void>;

      // Wait commands
      waitForPageLoad(): Chainable<void>;
      waitForApiCall(alias: string): Chainable<void>;

      // Navigation commands
      navigateTo(path: string): Chainable<void>;

      // Assertion commands
      shouldBeVisible(selector: string): Chainable<void>;
      shouldContainText(selector: string, text: string): Chainable<void>;
      shouldHaveValue(selector: string, value: string): Chainable<void>;

      // File upload commands
      uploadFile(selector: string, fileName: string): Chainable<void>;

      // Screenshot commands
      takeScreenshot(name: string): Chainable<void>;

      // Local storage commands
      setLocalStorage(key: string, value: any): Chainable<void>;

      // API commands
      interceptApi(method: string, url: string, alias: string): Chainable<void>;
      mockApiResponse(
        method: string,
        url: string,
        response: any,
        alias: string
      ): Chainable<void>;

      // Error handling commands
      handleError(callback: (err: Error) => void): Chainable<void>;

      // Logging commands - using built-in cy.log instead

      // Test data creation helpers
      createMockRecord(): Chainable<string>;
      createMockCompletedRecord(): Chainable<string>;

      // Mobile viewport helper
      setMobileViewport(): Chainable<void>;

      // Form filling helper
      fillForm(formData: Record<string, string>): Chainable<void>;
    }
  }
}

// Implement the commands (they are defined in e2e.ts)
export {};
