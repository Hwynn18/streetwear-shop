'use client';

import { useState } from 'react';

export default function ReviewItem({ review, isAdmin, showProductName = false }) {
  const [savedReply, setSavedReply] = useState(review.admin_reply || null);
  const [draft, setDraft] = useState(review.admin_reply || '');
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!draft.trim()) {
      setError('답변 내용을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '답변 등록에 실패했습니다.');
        return;
      }
      setSavedReply(draft);
      setEditing(false);
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <li className="border border-stone-200 rounded-xl p-5 bg-white">
      <div className="flex justify-between text-sm text-stone-500 mb-1">
        <span>
          {review.user_name}
          {showProductName && review.product_name ? ` · ${review.product_name}` : ''}
        </span>
        <span>{'⭐'.repeat(review.rating)}</span>
      </div>
      <p className="text-stone-800">{review.content}</p>
      <p className="text-xs text-stone-400 mt-2">
        {new Date(review.created_at).toLocaleDateString('ko-KR')}
      </p>

      {savedReply && !editing && (
        <div className="mt-4 bg-khaki-50 border border-khaki-100 rounded-lg p-4">
          <p className="text-xs font-semibold text-khaki-700 mb-1">관리자 답변</p>
          <p className="text-sm text-stone-700 whitespace-pre-line">{savedReply}</p>
          {isAdmin && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-khaki-600 hover:underline mt-2"
            >
              답변 수정
            </button>
          )}
        </div>
      )}

      {isAdmin && (!savedReply || editing) && (
        <div className="mt-4 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="답변을 입력해주세요."
            rows={2}
            maxLength={1000}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-khaki-400"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-stone-800 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-stone-900 disabled:opacity-50"
            >
              {submitting ? '등록 중...' : savedReply ? '수정 완료' : '답변 등록'}
            </button>
            {editing && (
              <button
                onClick={() => {
                  setEditing(false);
                  setDraft(savedReply);
                  setError('');
                }}
                className="text-xs px-4 py-1.5 rounded-lg border border-stone-300"
              >
                취소
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
