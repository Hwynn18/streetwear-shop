import { NextResponse } from 'next/server';
import { getCartByUser, addToCart, getProductById } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';
import { cartAddSchema, parseOrError } from '@/lib/validators';

// GET /api/cart -> 내 장바구니 조회 (로그인 필요, middleware.js에서 1차 검증)
export async function GET() {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }
    const items = getCartByUser(user.id);
    return NextResponse.json({ items });
  } catch (err) {
    console.error('[CART GET ERROR]', err);
    return NextResponse.json({ error: '장바구니를 불러오지 못했습니다.' }, { status: 500 });
  }
}

// POST /api/cart -> 상품 담기
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

    const { data, error } = parseOrError(cartAddSchema, {
      product_id: Number(body.product_id),
      quantity: Number(body.quantity ?? 1),
    });
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const product = getProductById(data.product_id);
    if (!product || !product.is_active) {
      return NextResponse.json({ error: '판매 중이 아닌 상품입니다.' }, { status: 404 });
    }
    if (product.stock < data.quantity) {
      return NextResponse.json({ error: `재고가 부족합니다. (남은 수량: ${product.stock}개)` }, { status: 409 });
    }

    const items = addToCart(user.id, data.product_id, data.quantity);
    return NextResponse.json({ message: '장바구니에 담았습니다.', items }, { status: 201 });
  } catch (err) {
    console.error('[CART POST ERROR]', err);
    return NextResponse.json({ error: '장바구니 담기에 실패했습니다.' }, { status: 500 });
  }
}
