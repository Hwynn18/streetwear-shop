import { NextResponse } from 'next/server';
import { getCartByUser, createOrdersFromCart } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function POST() {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const items = getCartByUser(user.id);
    if (items.length === 0) {
      return NextResponse.json({ error: '장바구니가 비어 있습니다.' }, { status: 400 });
    }

    const outOfStock = items.find((item) => item.quantity > item.stock);
    if (outOfStock) {
      return NextResponse.json(
        { error: `${outOfStock.product_name}의 재고가 부족합니다. (남은 수량: ${outOfStock.stock}개)` },
        { status: 409 }
      );
    }

    const orders = createOrdersFromCart(user.id);
    return NextResponse.json({ message: '주문이 완료되었습니다.', orders }, { status: 201 });
  } catch (err) {
    console.error('[CART CHECKOUT ERROR]', err);
    return NextResponse.json({ error: '주문 처리에 실패했습니다.' }, { status: 500 });
  }
}
