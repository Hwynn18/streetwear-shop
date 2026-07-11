import { NextResponse } from 'next/server';
import { replyToReview } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';
import { reviewReplySchema, parseOrError } from '@/lib/validators';

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// PUT /api/reviews/[id]/reply -> 관리자 전용 리뷰 답변 등록/수정
export async function PUT(request, { params }) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const id = parseId(params.id);
    if (!id) {
      return NextResponse.json({ error: '잘못된 리뷰 ID입니다.' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const { data, error } = parseOrError(reviewReplySchema, body || {});
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const review = replyToReview(id, data.content);
    if (!review) {
      return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '답변이 등록되었습니다.' });
  } catch (err) {
    console.error('[REVIEW REPLY ERROR]', err);
    return NextResponse.json({ error: '답변 등록에 실패했습니다.' }, { status: 500 });
  }
}
