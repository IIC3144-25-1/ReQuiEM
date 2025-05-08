import '@testing-library/jest-dom';

// Extender las expectativas de Jest
expect.extend({});

// Mock ResizeObserver que es requerido por algunos componentes de UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Suprimir warnings específicos si es necesario
const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};