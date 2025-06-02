// cypress.config.ts
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // La URL donde corre tu Next.js en modo dev
    baseUrl: "http://localhost:3000",
    // Tamaño “desktop” por defecto para que se aplique tu breakpoint lg:flex
    viewportWidth: 1280,
    viewportHeight: 720,
    // Dónde buscar tus spec files
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/commands.ts",
  },
});
