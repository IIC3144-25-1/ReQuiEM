import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

  // Store current request url in a custom header, which you can read later
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  return NextResponse.next({
    request: {
      // Apply new request headers
      headers: requestHeaders,
    }
  });
}