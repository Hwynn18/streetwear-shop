'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '로그인에 실패했습니다.');
        return;
      }

      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gradient-to-br from-stone-300 via-stone-100 to-stone-300 px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-stone-900 text-center mb-8">로그인</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="아이디"
            required
            maxLength={30}
            autoComplete="username"
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-khaki-400"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="비밀번호"
            required
            maxLength={72}
            autoComplete="current-password"
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-khaki-400"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-800 text-white rounded-lg py-2.5 font-medium hover:bg-stone-900 transition-colors disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-khaki-600 font-medium hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
