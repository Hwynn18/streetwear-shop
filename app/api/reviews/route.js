import { NextResponse } from 'next/server';
import { listReviews, createReview, getProductById } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';
import { reviewSchema, parseOrError } from '@/lib/validators';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (productId) {
      const id = Number(productId);
      if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json({ error: '잘못된 상품 ID입니다.' }, { status: 400 });
      }
      return NextResponse.json({ reviews: listReviews({ productId: id }) });
    }

    return NextResponse.json({ reviews: listReviews() });
  } catch (err) {
    console.error('[REVIEWS GET ERROR]', err);
    return NextResponse.json({ error: '리뷰를 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
    }

    const { data, error } = parseOrError(reviewSchema, {
      ...body,
      product_id: Number(body.product_id),
      rating: Number(body.rating),
    });
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!getProductById(data.product_id)) {
      return NextResponse.json({ error: '존재하지 않는 상품입니다.' }, { status: 404 });
    }

    createReview({ user_id: user.id, ...data });
    return NextResponse.json({ message: '리뷰가 등록되었습니다.' }, { status: 201 });
  } catch (err) {
    console.error('[REVIEWS POST ERROR]', err);
    return NextResponse.json({ error: '리뷰 등록에 실패했습니다.' }, { status: 500 });
  }
}
