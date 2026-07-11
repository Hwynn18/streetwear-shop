import { NextResponse } from 'next/server';
import { listProducts, createProduct } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';
import { productSchema, parseOrError } from '@/lib/validators';

// GET /api/products?category=tops        -> 공개: 판매중 상품만
// GET /api/products?all=1                -> 관리자 전용: 비활성 상품 포함 전체 조회
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const wantAll = searchParams.get('all') === '1';

    let includeInactive = false;
    if (wantAll) {
      const user = getCurrentUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
      }
      includeInactive = true;
    }

    const products = listProducts({ categorySlug: category || undefined, includeInactive });
    return NextResponse.json({ products });
  } catch (err) {
    console.error('[PRODUCTS GET ERROR]', err);
    return NextResponse.json({ error: '상품을 불러오지 못했습니다.' }, { status: 500 });
  }
}

// POST /api/products -> 상품 등록 (관리자 전용, 미들웨어에서 1차 인증 처리됨)
export async function POST(request) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
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

    const product = createProduct(data);
    return NextResponse.json({ message: '상품이 등록되었습니다.', id: product.id }, { status: 201 });
  } catch (err) {
    console.error('[PRODUCTS POST ERROR]', err);
    return NextResponse.json({ error: '상품 등록에 실패했습니다.' }, { status: 500 });
  }
}
