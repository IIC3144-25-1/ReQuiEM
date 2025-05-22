import React from 'react';

// Crear mock individual para cada icono
const createIconMock = (name: string) => {
  const Icon = (props: any) => <div data-testid={`${name.toLowerCase()}-icon`} {...props} />;
  return Icon;
};

// Exportar los iconos usados en el navbar
export const Book = createIconMock('Book');
export const Menu = createIconMock('Menu');
export const Sunset = createIconMock('Sunset');
export const Trees = createIconMock('Trees');
export const Zap = createIconMock('Zap');
export const Ambulance = createIconMock('Ambulance');