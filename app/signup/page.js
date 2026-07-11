'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const initialForm = { username: '', password: '', name: '', phone: '', email: '' };

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '회원가입에 실패했습니다.');
        return;
      }

      setSuccess('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      setTimeout(() => router.push('/login'), 1200);
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gradient-to-br from-stone-300 via-stone-100 to-stone-300 px-6 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-stone-900 text-center mb-8">회원가입</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="아이디 (영문/숫자 4자 이상)"
            required
            maxLength={30}
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-khaki-400"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="비밀번호 (영문+숫자 8자 이상)"
            required
            maxLength={72}
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-khaki-400"
          />
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="이름"
            required
            maxLength={30}
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-khaki-400"
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="전화번호 (010-1234-5678)"
            required
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-khaki-400"
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="이메일"
            required
            maxLength={100}
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-khaki-400"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-800 text-white rounded-lg py-2.5 font-medium hover:bg-stone-900 transition-colors disabled:opacity-50"
          >
            {loading ? '처리 중...' : '가입하기'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-khaki-600 font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
