import React, { Suspense } from 'react';
import { LoginForm } from './loginForm';

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full">
        <Suspense fallback={<div>Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}