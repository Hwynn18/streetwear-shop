import { NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';
import { productSchema, parseOrError } from '@/lib/validators';

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(request, { params }) {
  try {
    const id = parseId(params.id);
    if (!id) {
      return NextResponse.json({ error: '잘못된 상품 ID입니다.' }, { status: 400 });
    }

    const product = getProductById(id);
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err) {
    console.error('[PRODUCT GET ERROR]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const id = parseId(params.id);
    if (!id) {
      return NextResponse.json({ error: '잘못된 상품 ID입니다.' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
    }

    const { data, error } = parseOrError(productSchema, {
      ...body,
      category_id: Number(body.category_id),
      price: Number(body.price),
      stock: Number(body.stock ?? 0),
    });
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const updated = updateProduct(id, data);
    if (!updated) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ message: '상품이 수정되었습니다.' });
  } catch (err) {
    console.error('[PRODUCT PUT ERROR]', err);
    return NextResponse.json({ error: '상품 수정에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const id = parseId(params.id);
    if (!id) {
      return NextResponse.json({ error: '잘못된 상품 ID입니다.' }, { status: 400 });
    }

    const deleted = deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ message: '상품이 삭제되었습니다.' });
  } catch (err) {
    console.error('[PRODUCT DELETE ERROR]', err);
    return NextResponse.json({ error: '상품 삭제에 실패했습니다.' }, { status: 500 });
  }
}
