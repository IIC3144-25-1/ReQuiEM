import React, { Suspense } from 'react';
import { LoginForm } from './loginForm';
import Loading from '../loading';
import { auth } from '@/auth';

export default async function Page() {
  const session = await auth()

  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full">
        <Suspense fallback={<Loading />}>
          { session?.user ? <p>Ya estas logeado</p> : <LoginForm />}
        </Suspense>
      </div>
    </div>
  );
}