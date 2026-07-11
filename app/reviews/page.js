'use client';

import { useEffect, useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: '', rating: 5, content: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, productsRes] = await Promise.all([
        fetch('/api/reviews'),
        fetch('/api/products'),
      ]);
      const reviewsData = await reviewsRes.json();
      const productsData = await productsRes.json();
      setReviews(reviewsData.reviews || []);
      setProducts(productsData.products || []);
    } catch (err) {
      setError('데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.product_id) {
      setError('상품을 선택해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: Number(form.product_id),
          rating: Number(form.rating),
          content: form.content,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '리뷰 등록에 실패했습니다.');
        return;
      }
      setForm({ product_id: '', rating: 5, content: '' });
      loadData();
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <ScrollReveal>
        <h1 className="text-2xl font-bold text-stone-900 mb-8">리뷰</h1>
      </ScrollReveal>

      <ScrollReveal>
        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 mb-10 space-y-3">
          <select
            value={form.product_id}
            onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            className="w-full border border-stone-300 rounded-lg px-3 py-2"
          >
            <option value="">상품 선택</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            className="w-full border border-stone-300 rounded-lg px-3 py-2"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {'⭐'.repeat(r)}
              </option>
            ))}
          </select>

          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="리뷰 내용을 입력해주세요."
            required
            maxLength={1000}
            rows={3}
            className="w-full border border-stone-300 rounded-lg px-3 py-2"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-stone-800 text-white px-6 py-2 rounded-lg hover:bg-stone-900 disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '리뷰 등록'}
          </button>
          <p className="text-xs text-stone-400">* 로그인 후 작성 가능합니다.</p>
        </form>
      </ScrollReveal>

      {loading ? (
        <p className="text-stone-400">불러오는 중...</p>
      ) : reviews.length === 0 ? (
        <p className="text-stone-400">등록된 리뷰가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <ScrollReveal key={r.id}>
              <li className="border border-stone-200 rounded-xl p-5 bg-white">
                <div className="flex justify-between text-sm text-stone-500 mb-1">
                  <span>{r.product_name}</span>
                  <span>{'⭐'.repeat(r.rating)}</span>
                </div>
                <p className="text-stone-800">{r.content}</p>
                <p className="text-xs text-stone-400 mt-2">
                  {r.user_name} · {new Date(r.created_at).toLocaleDateString('ko-KR')}
                </p>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      )}
    </div>
  );
}
