import { NextResponse } from 'next/server';
import { findUserByUsernameOrEmail, createUser } from '@/lib/store';
import { hashPassword } from '@/lib/auth';
import { signupSchema, parseOrError } from '@/lib/validators';

// 간단한 인메모리 rate limit (동일 IP 반복 가입 시도 방지). 운영환경에서는 Redis 등 외부 스토어 권장.
const attempts = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const record = attempts.get(ip) || { count: 0, start: now };
  if (now - record.start > WINDOW_MS) {
    attempts.set(ip, { count: 1, start: now });
    return false;
  }
  record.count += 1;
  attempts.set(ip, record);
  return record.count > MAX_ATTEMPTS;
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
    }

    const { data, error } = parseOrError(signupSchema, body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const { username, password, name, phone, email } = data;

    const existing = findUserByUsernameOrEmail(username, email);
    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 아이디 또는 이메일입니다.' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    createUser({ username, password_hash, name, phone, email });

    return NextResponse.json({ message: '회원가입이 완료되었습니다.' }, { status: 201 });
  } catch (err) {
    console.error('[SIGNUP ERROR]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
