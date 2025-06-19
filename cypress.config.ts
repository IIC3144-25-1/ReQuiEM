import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,

    env: {
      // Test environment variables - use MongoDB Atlas test database
      MONGODB_URI_TEST:
        process.env.MONGODB_URI_TEST ||
        process.env.MONGODB_URI?.replace(/\/[^/]*$/, "/requiem_test"),
      NEXTAUTH_URL: "http://localhost:3000",
      NEXTAUTH_SECRET: "test-secret-for-cypress",
    },

    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("task", {
        // Database seeding and cleanup tasks
        seedDatabase: async () => {
          // This will be implemented to seed test data
          return null;
        },

        clearDatabase: async () => {
          // This will be implemented to clear test data
          return null;
        },

        // Create test user
        createTestUser: async (userData) => {
          // This will be implemented to create test users
          return userData;
        },

        // Log messages from tests
        log: (message) => {
          console.log(message);
          return null;
        },

        // Check if file exists
        fileExists: (filename) => {
          const fs = require("fs");
          const path = require("path");
          const filePath = path.join(__dirname, filename);
          return fs.existsSync(filePath);
        },
      });

      // Return the config object
      return config;
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/component.ts",
  },

  // Global configuration
  retries: {
    runMode: 2,
    openMode: 0,
  },

  watchForFileChanges: false,
  chromeWebSecurity: false,

  // Folders
  downloadsFolder: "cypress/downloads",
  fixturesFolder: "cypress/fixtures",
  screenshotsFolder: "cypress/screenshots",
  videosFolder: "cypress/videos",
});
