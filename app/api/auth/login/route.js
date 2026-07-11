import { NextResponse } from 'next/server';
import { findUserByUsername } from '@/lib/store';
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth';
import { loginSchema, parseOrError } from '@/lib/validators';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
    }

    const { data, error } = parseOrError(loginSchema, body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const user = findUserByUsername(data.username);

    // 존재하지 않는 아이디와 비밀번호 불일치를 동일한 메시지로 응답 (계정 존재 여부 노출 방지)
    if (!user) {
      return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    const isValid = await verifyPassword(data.password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    const token = signToken({ id: user.id, username: user.username, role: user.role, name: user.name });

    const response = NextResponse.json({
      message: '로그인 성공',
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    });
    setAuthCookie(response, token);
    return response;
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
