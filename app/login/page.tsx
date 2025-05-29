import React, { Suspense } from 'react';
import { LoginForm } from './loginForm';
import Loading from '../loading';

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full">
        <Suspense fallback={<Loading />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}