'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddToCartButton({ productId, stock }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const soldOut = stock <= 0;

  const changeQuantity = (delta) => {
    setQuantity((q) => Math.min(Math.max(1, q + delta), Math.max(1, stock)));
  };

  const handleAdd = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      const data = await res.json();

      if (res.status === 401) {
        router.push(`/login?redirect=/clothes/product/${productId}`);
        return;
      }
      if (!res.ok) {
        setError(data.error || '장바구니 담기에 실패했습니다.');
        return;
      }
      setMessage('장바구니에 담았습니다.');
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-stone-300 rounded-lg">
          <button
            type="button"
            onClick={() => changeQuantity(-1)}
            disabled={soldOut}
            className="px-3 py-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
          >
            −
          </button>
          <span className="w-10 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => changeQuantity(1)}
            disabled={soldOut}
            className="px-3 py-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
          >
            +
          </button>
        </div>
        <span className="text-sm text-stone-400">재고 {stock}개</span>
      </div>

      <button
        onClick={handleAdd}
        disabled={loading || soldOut}
        className="w-full bg-stone-800 text-white rounded-lg py-3 font-medium hover:bg-stone-900 transition-colors disabled:opacity-50"
      >
        {soldOut ? '품절' : loading ? '담는 중...' : '장바구니 담기'}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}
    </div>
  );
}
