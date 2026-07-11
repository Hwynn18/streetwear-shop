import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // edge 런타임에서는 jsonwebtoken 대신 jose 사용

const encoder = new TextEncoder();

async function verify(token) {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(process.env.JWT_SECRET));
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const isReviewReplyRoute = /^\/api\/reviews\/\d+\/reply$/.test(pathname);
  const isAdminRoute =
    pathname.startsWith('/admin') ||
    (pathname.startsWith('/api/products') && request.method !== 'GET') ||
    (pathname.startsWith('/api/faqs') && request.method !== 'GET') ||
    isReviewReplyRoute;
  const isMyPageRoute =
    pathname.startsWith('/mypage') ||
    pathname.startsWith('/api/mypage') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/api/cart');

  if (!isAdminRoute && !isMyPageRoute) {
    return NextResponse.next();
  }

  const payload = token ? await verify(token) : null;

  if (!payload) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && payload.role !== 'admin') {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/mypage/:path*',
    '/cart/:path*',
    '/api/products/:path*',
    '/api/mypage/:path*',
    '/api/cart/:path*',
    '/api/faqs/:path*',
    '/api/reviews/:path*',
  ],
};
