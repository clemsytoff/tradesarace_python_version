import { NextResponse } from 'next/server';
import { expiredSessionCookieConfig } from '../../../../src/lib/session';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(expiredSessionCookieConfig());
  return response;
}

