# STREET.WEAR — 스트릿 캐주얼 쇼핑몰

Next.js(App Router) + Tailwind CSS + Node API Routes 기반 쇼핑몰입니다.

> ⚠️ **현재 상태(테스트 모드)**: DB로 MySQL을 붙이기 전, 빠른 테스트를 위해 `lib/store.js`가
> `lib/data/db.json` 파일에 데이터를 저장/조회합니다. **MySQL 설치 없이 `npm install` → `npm run dev`만으로 바로 실행됩니다.**
> `database/schema.sql`, `lib/db.js`(mysql2 커넥션 풀)는 운영 전환 시 사용할 수 있도록 그대로 남겨뒀습니다.
> 전환 시 `lib/store.js`와 동일한 함수 시그니처로 `lib/db.js` 쿼리를 구현해 API 라우트의 import만 바꿔주면 됩니다.

## 폴더 구조 (기능별 분리)

```
app/                    페이지 & API 라우트
  api/                  백엔드 API (auth, products, reviews, mypage, cart)
  clothes/[category]/   의류 카테고리별 그리드 페이지
  clothes/product/[id]/ 상품 상세 페이지
  cart/                 장바구니 페이지
  login, signup, mypage, reviews, faq, admin/products
components/             재사용 UI 컴포넌트 (Header, ProductCard, AddToCartButton 등)
lib/
  store.js              ✅ 현재 사용 중인 테스트용 자체 저장소 (JSON 파일)
  data/db.json           저장 데이터 (최초 실행 시 자동 생성 + 샘플 상품 5종 시드)
  db.js                  MySQL 커넥션 풀 (운영 전환용, 현재 미사용)
  auth.js, validators.js
database/               schema.sql(DDL), init.js — 운영 전환 시 사용
middleware.js           /admin, /mypage, /cart 라우트 보호
```

## 실행 방법 (테스트 모드 — DB 설치 불필요)

```bash
npm install
cp .env.example .env      # JWT_SECRET만 채워도 실행 가능 (DB_* 값은 지금은 사용 안 함)
npm run dev
```

기본 관리자 계정: `admin` / `ChangeMe123!` (최초 실행 시 자동 생성) — 운영 전환 전 반드시 비밀번호를 변경하세요.
`lib/data/db.json` 파일을 지우면 데이터가 초기 샘플 상태로 리셋됩니다.

## 신규 기능

- **상품 상세페이지** (`/clothes/product/[id]`): 이미지·설명·재고·수량 선택 후 장바구니 담기, 해당 상품 리뷰 표시
- **장바구니** (`/cart`): 수량 변경, 삭제, 재고 검증, "주문하기" 클릭 시 주문(orders)으로 전환 후 마이페이지 주문내역에 반영
- 장바구니 담기/조회는 로그인 필요 (`middleware.js`에서 서버단 강제)
- 헤더 우측 🛒 아이콘에 담긴 수량 실시간 표시
- **리뷰 관리자 답글**: `/reviews`에서 관리자로 로그인하면 각 리뷰 하단에 답변 등록/수정 폼이 노출됨 (`PUT /api/reviews/[id]/reply`)
- **FAQ 질문·답변**: `/faq` 하단에서 로그인한 사용자가 질문 등록 → 관리자가 `/admin/faq`에서 답변 등록 시 공개 FAQ 아코디언에 자동 반영 (미답변 질문은 공개 목록에 노출되지 않음)

## 보안 점검 체크리스트

- **비밀번호**: bcrypt(salt rounds 10~12)로 해시 저장, 평문 저장/로깅 없음.
- **인증**: JWT를 `httpOnly + sameSite=lax` 쿠키에 저장하여 XSS로 인한 토큰 탈취 및 CSRF 위험 최소화.
- **인가**: `middleware.js`에서 `/admin/*`, `/mypage/*`, `/cart/*`, 상품 등록/수정/삭제 API를 서버 단에서 강제 검증.
- **입력 검증**: 모든 API는 `zod` 스키마로 서버단 검증 후 처리 (클라이언트 검증은 UX용 보조 수단).
- **재고 검증**: 장바구니 담기/수량변경/주문전환 시마다 서버에서 재고를 재확인 (동시성 이슈 완화).
- **에러 처리**: 모든 API 핸들러에 try/catch 적용, 클라이언트에는 일반화된 메시지만 반환.
- **계정 열거 방지**: 로그인 실패 시 "아이디 없음"과 "비밀번호 오류"를 동일 메시지로 응답.
- **Rate Limit**: 회원가입 API에 IP 기준 간단한 레이트리밋 적용.
- **보안 헤더**: `next.config.js`에서 X-Frame-Options, X-Content-Type-Options 등 기본 헤더 적용.

## 운영(MySQL) 전환 체크리스트

1. `.env`에 `DB_*` 값 채우기, `npm run db:init`으로 스키마 적용 + 관리자 시드
2. `lib/store.js`의 각 함수(예: `listProducts`, `addToCart`)와 동일한 이름/시그니처로 `lib/db.js` 기반 쿼리 함수 구현
3. API 라우트 상단의 `import { ... } from '@/lib/store'`를 새 구현으로 교체
4. `lib/data/db.json` 및 `global.__store` 캐시 제거

