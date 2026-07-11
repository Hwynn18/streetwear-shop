'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart');
      if (res.status === 401) {
        router.push('/login?redirect=/cart');
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError('장바구니를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    setPendingId(id);
    setError('');
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '수량 변경에 실패했습니다.');
        return;
      }
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setPendingId(null);
    }
  };

  const removeItem = async (id) => {
    setPendingId(id);
    setError('');
    try {
      const res = await fetch(`/api/cart/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '삭제에 실패했습니다.');
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setPendingId(null);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setError('');
    try {
      const res = await fetch('/api/cart/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '주문 처리에 실패했습니다.');
        return;
      }
      router.push('/mypage');
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setCheckingOut(false);
    }
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (loading) return <p className="max-w-4xl mx-auto px-6 py-16 text-stone-400">불러오는 중...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <ScrollReveal>
        <h1 className="text-2xl font-bold text-stone-900 mb-8">장바구니</h1>
      </ScrollReveal>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-400 mb-4">장바구니가 비어 있습니다.</p>
          <Link href="/clothes/tops" className="text-khaki-600 font-medium hover:underline">
            쇼핑 계속하기
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-stone-200 border-t border-b border-stone-200 mb-8">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-5">
                <img src={item.image_url} alt={item.product_name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className="font-medium text-stone-800">{item.product_name}</p>
                  <p className="text-sm text-stone-500">{item.price.toLocaleString()}원</p>
                </div>

                <div className="flex items-center border border-stone-300 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={pendingId === item.id}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={pendingId === item.id || item.quantity >= item.stock}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <p className="w-24 text-right font-medium text-stone-800">
                  {(item.price * item.quantity).toLocaleString()}원
                </p>

                <button
                  onClick={() => removeItem(item.id)}
                  disabled={pendingId === item.id}
                  className="text-stone-400 hover:text-red-500 text-sm ml-2"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center">
            <p className="text-lg font-bold text-stone-900">
              총 결제금액 <span className="text-khaki-600">{total.toLocaleString()}원</span>
            </p>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="bg-stone-800 text-white px-8 py-3 rounded-full hover:bg-stone-900 transition-colors disabled:opacity-50"
            >
              {checkingOut ? '처리 중...' : '주문하기'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
