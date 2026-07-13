import { z } from 'zod';

export const signupSchema = z.object({
  username: z
    .string()
    .min(4, '아이디는 4자 이상이어야 합니다.')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, '아이디는 영문/숫자/언더스코어만 가능합니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .max(72) // bcrypt 제한
    .regex(/[A-Za-z]/, '비밀번호에 영문자를 포함해주세요.')
    .regex(/[0-9]/, '비밀번호에 숫자를 포함해주세요.'),
  name: z.string().min(1, '이름을 입력해주세요.').max(30),
  phone: z
    .string()
    .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, '올바른 휴대폰 번호 형식이 아닙니다.'),
  email: z.string().email('올바른 이메일 형식이 아닙니다.').max(100),
});

export const loginSchema = z.object({
  username: z.string().min(1).max(30),
  password: z.string().min(1).max(72),
});

export const productSchema = z.object({
  category_id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  price: z.number().int().nonnegative(),
  image_url: z
  .string()
  .min(1, '상품 이미지를 업로드해주세요.')
  .max(500)
  .refine((v) => /^https?:\/\//.test(v) || v.startsWith('/uploads/'), '올바른 이미지 경로가 아닙니다.'),
  description: z.string().max(2000).optional().default(''),
  stock: z.number().int().nonnegative().default(0),
  is_active: z.boolean().optional().default(true),
});

export const reviewSchema = z.object({
  product_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(1, '리뷰 내용을 입력해주세요.').max(1000),
});

export const faqSchema = z.object({
  question: z.string().min(1, '질문을 입력해주세요.').max(300),
  answer: z.string().min(1, '답변을 입력해주세요.').max(2000),
});

export const reviewReplySchema = z.object({
  content: z.string().min(1, '답변 내용을 입력해주세요.').max(1000),
});

export const faqQuestionSchema = z.object({
  question: z.string().min(1, '질문을 입력해주세요.').max(300),
});

export const faqAnswerSchema = z.object({
  answer: z.string().min(1, '답변 내용을 입력해주세요.').max(2000),
});

export const cartAddSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
});

export const cartUpdateSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

/** API 라우트 공용 검증 헬퍼: 실패 시 { error } 반환, 성공 시 { data } 반환 */
export function parseOrError(schema, payload) {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const message = result.error.issues[0]?.message || '입력값이 올바르지 않습니다.';
    return { error: message };
  }
  return { data: result.data };
}
