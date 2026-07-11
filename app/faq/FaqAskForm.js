'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FaqAskForm() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((d) => setIsLoggedIn(!!d.user))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (res.status === 401) {
        router.push('/login?redirect=/faq');
        return;
      }
      if (!res.ok) {
        setError(data.error || '질문 등록에 실패했습니다.');
        return;
      }
      setSuccess(data.message || '질문이 등록되었습니다.');
      setQuestion('');
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 border-t border-stone-200 pt-10">
      <h2 className="text-lg font-bold text-stone-900 mb-1">궁금한 점이 있으신가요?</h2>
      <p className="text-sm text-stone-400 mb-5">질문을 남기시면 관리자가 확인 후 답변을 등록해드립니다.</p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="질문을 입력해주세요."
          required
          maxLength={300}
          className="flex-1 border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-khaki-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-stone-800 text-white px-6 py-2.5 rounded-lg hover:bg-stone-900 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? '등록 중...' : '질문 등록'}
        </button>
      </form>

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      {success && <p className="text-sm text-green-600 mt-2">{success}</p>}
      {!isLoggedIn && (
        <p className="text-xs text-stone-400 mt-2">
          * 로그인 후 이용 가능합니다.{' '}
          <Link href="/login?redirect=/faq" className="underline">
            로그인하기
          </Link>
        </p>
      )}
    </div>
  );
}
