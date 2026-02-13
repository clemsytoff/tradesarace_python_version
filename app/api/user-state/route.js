import { NextResponse } from 'next/server';
import { getDb } from '../../../src/lib/auth-db';

const DEFAULT_WALLET = {
  usdBalance: 20000,
  btcBalance: 0.35,
  bonus: 185,
};

function normalizeWallet(wallet) {
  if (
    wallet &&
    typeof wallet.usdBalance === 'number' &&
    typeof wallet.btcBalance === 'number' &&
    typeof wallet.bonus === 'number'
  ) {
    return wallet;
  }
  return DEFAULT_WALLET;
}

function normalizePositions(positions) {
  if (!Array.isArray(positions)) return [];

  return positions
    .filter((position) => (
      position &&
      typeof position.id === 'string' &&
      typeof position.currency === 'string' &&
      (position.side === 'buy' || position.side === 'sell') &&
      typeof position.leverage === 'number' &&
      typeof position.amount === 'number' &&
      typeof position.executionPrice === 'number'
    ))
    .map((position) => ({
      ...position,
      placedAt: position.placedAt || new Date().toISOString(),
    }));
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export async function GET(request) {
  const userIdParam = request.nextUrl.searchParams.get('userId');
  const userId = Number(userIdParam);

  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json(
      { ok: false, message: 'A valid userId is required.' },
      { status: 400 }
    );
  }

  try {
    const db = await getDb();
    const user = await db.get(
      'SELECT id, wallet_json, positions_json FROM users WHERE id = ?',
      userId
    );

    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    const wallet = normalizeWallet(parseJson(user.wallet_json, DEFAULT_WALLET));
    const positions = normalizePositions(parseJson(user.positions_json, []));

    return NextResponse.json({ ok: true, wallet, positions });
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Unable to load user state.' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const userId = Number(body?.userId);

    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json(
        { ok: false, message: 'A valid userId is required.' },
        { status: 400 }
      );
    }

    const wallet = normalizeWallet(body?.wallet);
    const positions = normalizePositions(body?.positions);
    const db = await getDb();

    const result = await db.run(
      'UPDATE users SET wallet_json = ?, positions_json = ? WHERE id = ?',
      JSON.stringify(wallet),
      JSON.stringify(positions),
      userId
    );

    if (!result.changes) {
      return NextResponse.json(
        { ok: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Unable to save user state.' },
      { status: 500 }
    );
  }
}
