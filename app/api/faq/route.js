import { NextResponse } from 'next/server';
import { listFaqs, listFaqsForAdmin, askFaqQuestion } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';
import { faqQuestionSchema, parseOrError } from '@/lib/validators';

// GET /api/faq            -> 공개: 답변이 등록된 질문만
// GET /api/faq?all=1      -> 관리자 전용: 미답변 포함 전체 목록
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wantAll = searchParams.get('all') === '1';

    if (wantAll) {
      const user = getCurrentUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
      }
      return NextResponse.json({ faqs: listFaqsForAdmin() });
    }

    return NextResponse.json({ faqs: listFaqs({ onlyAnswered: true }) });
  } catch (err) {
    console.error('[FAQ GET ERROR]', err);
    return NextResponse.json({ error: 'FAQ를 불러오지 못했습니다.' }, { status: 500 });
  }
}

// POST /api/faq -> 로그인한 사용자가 질문 등록 (답변 대기 상태)
export async function POST(request) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const { data, error } = parseOrError(faqQuestionSchema, body || {});
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    askFaqQuestion({ user_id: user.id, question: data.question });
    return NextResponse.json(
      { message: '질문이 등록되었습니다. 답변 등록 시 FAQ 목록에 표시됩니다.' },
      { status: 201 }
    );
  } catch (err) {
    console.error('[FAQ POST ERROR]', err);
    return NextResponse.json({ error: '질문 등록에 실패했습니다.' }, { status: 500 });
  }
}
