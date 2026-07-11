import { NextResponse } from 'next/server';
import { answerFaq, deleteFaq } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';
import { faqAnswerSchema, parseOrError } from '@/lib/validators';

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// PUT /api/faq/[id] -> 관리자가 답변 등록/수정
export async function PUT(request, { params }) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const id = parseId(params.id);
    if (!id) {
      return NextResponse.json({ error: '잘못된 FAQ ID입니다.' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const { data, error } = parseOrError(faqAnswerSchema, body || {});
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const faq = answerFaq(id, data.answer);
    if (!faq) {
      return NextResponse.json({ error: 'FAQ를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '답변이 등록되었습니다.' });
  } catch (err) {
    console.error('[FAQ ANSWER ERROR]', err);
    return NextResponse.json({ error: '답변 등록에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/faq/[id] -> 관리자가 질문/답변 삭제
export async function DELETE(request, { params }) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const id = parseId(params.id);
    if (!id) {
      return NextResponse.json({ error: '잘못된 FAQ ID입니다.' }, { status: 400 });
    }

    const deleted = deleteFaq(id);
    if (!deleted) {
      return NextResponse.json({ error: 'FAQ를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (err) {
    console.error('[FAQ DELETE ERROR]', err);
    return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
  }
}
