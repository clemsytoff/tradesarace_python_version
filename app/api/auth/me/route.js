import { NextResponse } from 'next/server';
import { query } from '../../../../src/lib/auth-db';
import { getSessionUserIdFromRequest } from '../../../../src/lib/session';

export async function GET(request) {
  const userId = getSessionUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const result = await query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [userId]
    );
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user: { id: Number(user.id), name: user.name, email: user.email },
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Unable to load authenticated user.' },
      { status: 500 }
    );
  }
}

