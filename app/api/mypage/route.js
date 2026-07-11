import { NextResponse } from 'next/server';
import { findUserById, updateUserProfile, listOrdersByUser } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).max(30),
  phone: z.string().regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, '올바른 휴대폰 번호 형식이 아닙니다.'),
});

export async function GET() {
  try {
    const authUser = getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = findUserById(authUser.id);
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const { password_hash, ...profile } = user;
    const orders = listOrdersByUser(authUser.id);

    return NextResponse.json({ profile, orders });
  } catch (err) {
    console.error('[MYPAGE GET ERROR]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authUser = getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
    }

    updateUserProfile(authUser.id, result.data);
    return NextResponse.json({ message: '정보가 수정되었습니다.' });
  } catch (err) {
    console.error('[MYPAGE PUT ERROR]', err);
    return NextResponse.json({ error: '정보 수정에 실패했습니다.' }, { status: 500 });
  }
}
