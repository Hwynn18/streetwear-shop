import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({ user });
  } catch (err) {
    console.error('[ME ERROR]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
