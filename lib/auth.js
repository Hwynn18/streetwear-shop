import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { findUserById } from './store';

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

const COOKIE_OPTIONS = {
  httpOnly: true, // JS에서 접근 불가 (XSS로 토큰 탈취 방지)
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax', // CSRF 방지
  path: '/',
};

export function setAuthCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response) {
  // 설정 시와 동일한 옵션(path/sameSite/secure)으로 만료시켜야 일부 브라우저에서
  // 쿠키가 남아있는 문제(로그아웃 후에도 이전 세션이 유지되는 문제)를 방지할 수 있음
  response.cookies.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0, expires: new Date(0) });
}

/**
 * 서버 컴포넌트/라우트 핸들러에서 현재 로그인 사용자 조회
 * 토큰에 서명 당시 박제된 role을 그대로 믿지 않고, 매 요청마다 store에서
 * 최신 사용자 정보를 다시 조회해서 반환한다.
 * -> 관리자 계정 재시딩/권한 변경/탈퇴 등이 즉시 반영됨 (오래된 토큰의 role로 오판하는 문제 방지)
 */
export function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const currentUser = findUserById(payload.id);
  if (!currentUser) return null; // 삭제되었거나 존재하지 않는 사용자

  return {
    id: currentUser.id,
    username: currentUser.username,
    role: currentUser.role,
    name: currentUser.name,
  };
}

export { COOKIE_NAME };
