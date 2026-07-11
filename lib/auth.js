import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRES_IN = '7d';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  // 서버 부팅 시점에 취약한 시크릿을 사용하지 못하도록 방어
  console.warn('⚠️  JWT_SECRET이 설정되지 않았거나 너무 짧습니다. .env를 확인하세요.');
}

export async function hashPassword(plain) {
  const SALT_ROUNDS = 12;
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null; // 만료/위조 토큰은 null 처리 -> 호출부에서 401 응답
  }
}

export function setAuthCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true, // JS에서 접근 불가 (XSS로 토큰 탈취 방지)
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax', // CSRF 방지
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response) {
  response.cookies.set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

/** 서버 컴포넌트/라우트 핸들러에서 현재 로그인 사용자 조회 */
export function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE_NAME };
