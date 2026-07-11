'use client';

import { useEffect, useState } from 'react';

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/faq?all=1');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'FAQ를 불러오지 못했습니다.');
        return;
      }
      setFaqs(data.faqs || []);
      setDrafts(Object.fromEntries((data.faqs || []).map((f) => [f.id, f.answer || ''])));
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleAnswer = async (id) => {
    const answer = (drafts[id] || '').trim();
    if (!answer) {
      setError('답변 내용을 입력해주세요.');
      return;
    }
    setSavingId(id);
    setError('');
    try {
      const res = await fetch(`/api/faq/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '답변 등록에 실패했습니다.');
        return;
      }
      loadFaqs();
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('이 질문을 삭제하시겠습니까?')) return;
    setError('');
    try {
      const res = await fetch(`/api/faq/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '삭제에 실패했습니다.');
        return;
      }
      loadFaqs();
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  const pendingCount = faqs.filter((f) => !f.answer).length;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-2xl font-bold text-stone-900">FAQ 관리</h1>
        {pendingCount > 0 && (
          <span className="text-sm text-khaki-600 font-medium">답변 대기 {pendingCount}건</span>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-stone-400">불러오는 중...</p>
      ) : faqs.length === 0 ? (
        <p className="text-stone-400">등록된 질문이 없습니다.</p>
      ) : (
        <div className="divide-y divide-stone-200 border-t border-b border-stone-200">
          {faqs.map((faq) => (
            <div key={faq.id} className="py-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mr-2 ${
                      faq.answer ? 'bg-khaki-100 text-khaki-700' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {faq.answer ? '답변완료' : '답변대기'}
                  </span>
                  <span className="text-stone-800 font-medium">Q. {faq.question}</span>
                  <p className="text-xs text-stone-400 mt-1">
                    {faq.asker_name ? `${faq.asker_name} · ` : '관리자 등록 · '}
                    {new Date(faq.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="text-xs text-red-400 hover:text-red-600 whitespace-nowrap"
                >
                  삭제
                </button>
              </div>

              <textarea
                value={drafts[faq.id] ?? ''}
                onChange={(e) => setDrafts({ ...drafts, [faq.id]: e.target.value })}
                placeholder="답변을 입력해주세요."
                rows={2}
                maxLength={2000}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-khaki-400"
              />
              <button
                onClick={() => handleAnswer(faq.id)}
                disabled={savingId === faq.id}
                className="mt-2 bg-stone-800 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-stone-900 disabled:opacity-50"
              >
                {savingId === faq.id ? '저장 중...' : faq.answer ? '답변 수정' : '답변 등록'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
