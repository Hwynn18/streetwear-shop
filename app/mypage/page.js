'use client';

import { useEffect, useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';

export default function MyPage() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mypage')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setForm({ name: data.profile.name, phone: data.profile.phone });
          setOrders(data.orders || []);
        }
      })
      .catch(() => setError('정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/mypage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '수정에 실패했습니다.');
        return;
      }
      setMessage('정보가 수정되었습니다.');
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  if (loading) return <p className="max-w-3xl mx-auto px-6 py-16 text-stone-400">불러오는 중...</p>;
  if (!profile) return <p className="max-w-3xl mx-auto px-6 py-16 text-stone-400">로그인이 필요합니다.</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
      <ScrollReveal>
        <h1 className="text-2xl font-bold text-stone-900 mb-6">마이페이지</h1>

        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
          <div>
            <label className="text-xs text-stone-400">아이디</label>
            <p className="text-stone-700">{profile.username}</p>
          </div>
          <div>
            <label className="text-xs text-stone-400">이메일</label>
            <p className="text-stone-700">{profile.email}</p>
          </div>
          <div>
            <label className="text-xs text-stone-400">이름</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 mt-1"
              maxLength={30}
              required
            />
          </div>
          <div>
            <label className="text-xs text-stone-400">전화번호</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <button className="bg-stone-800 text-white px-6 py-2 rounded-lg hover:bg-stone-900">
            정보 수정
          </button>
        </form>
      </ScrollReveal>

      <ScrollReveal>
        <h2 className="text-xl font-bold text-stone-900 mb-4">주문 내역</h2>
        {orders.length === 0 ? (
          <p className="text-stone-400">주문 내역이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center gap-4 border border-stone-200 rounded-xl p-4 bg-white">
                <img src={o.image_url} alt={o.product_name} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className="font-medium text-stone-800">{o.product_name}</p>
                  <p className="text-sm text-stone-500">
                    {o.quantity}개 · {o.total_price.toLocaleString()}원
                  </p>
                </div>
                <span className="text-sm text-khaki-600 font-medium">{o.status}</span>
              </li>
            ))}
          </ul>
        )}
      </ScrollReveal>
    </div>
  );
}
