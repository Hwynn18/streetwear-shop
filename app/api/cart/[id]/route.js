import { NextResponse } from 'next/server';
import { updateCartItemQuantity, removeCartItem, getProductById } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';
import { cartUpdateSchema, parseOrError } from '@/lib/validators';

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request, { params }) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const id = parseId(params.id);
    if (!id) {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const { data, error } = parseOrError(cartUpdateSchema, {
      quantity: Number(body?.quantity),
    });
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const item = updateCartItemQuantity(user.id, id, data.quantity);
    if (!item) {
      return NextResponse.json({ error: '장바구니 항목을 찾을 수 없습니다.' }, { status: 404 });
    }

    const product = getProductById(item.product_id);
    if (product && data.quantity > product.stock) {
      return NextResponse.json({ error: `재고가 부족합니다. (남은 수량: ${product.stock}개)` }, { status: 409 });
    }

    return NextResponse.json({ message: '수량이 변경되었습니다.' });
  } catch (err) {
    console.error('[CART PATCH ERROR]', err);
    return NextResponse.json({ error: '수량 변경에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const id = parseId(params.id);
    if (!id) {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }

    const deleted = removeCartItem(user.id, id);
    if (!deleted) {
      return NextResponse.json({ error: '장바구니 항목을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (err) {
    console.error('[CART DELETE ERROR]', err);
    return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
  }
}
