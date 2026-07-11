'use client';

import { useEffect, useState } from 'react';

const CATEGORIES = [
  { id: 1, name: '상의' },
  { id: 2, name: '하의' },
  { id: 3, name: '모자' },
  { id: 4, name: '겉옷' },
  { id: 5, name: '양말' },
];

const emptyForm = {
  category_id: 1,
  name: '',
  price: 0,
  image_url: '',
  description: '',
  stock: 0,
  is_active: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?all=1');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      setError('상품 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          category_id: Number(form.category_id),
          price: Number(form.price),
          stock: Number(form.stock),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '처리에 실패했습니다.');
        return;
      }
      resetForm();
      loadProducts();
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      category_id: p.category_id,
      name: p.name,
      price: p.price,
      image_url: p.image_url,
      description: p.description || '',
      stock: p.stock,
      is_active: !!p.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '삭제에 실패했습니다.');
        return;
      }
      loadProducts();
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-stone-900 mb-8">상품 관리</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 mb-10 grid md:grid-cols-2 gap-3">
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className="border border-stone-300 rounded-lg px-3 py-2"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          placeholder="상품명"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          maxLength={100}
          className="border border-stone-300 rounded-lg px-3 py-2"
        />
        <input
          type="number"
          placeholder="가격"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
          min={0}
          className="border border-stone-300 rounded-lg px-3 py-2"
        />
        <input
          type="number"
          placeholder="재고"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          min={0}
          className="border border-stone-300 rounded-lg px-3 py-2"
        />
        <input
          placeholder="이미지 URL"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          required
          className="border border-stone-300 rounded-lg px-3 py-2 md:col-span-2"
        />
        <textarea
          placeholder="상품 설명"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="border border-stone-300 rounded-lg px-3 py-2 md:col-span-2"
        />
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          판매 활성화
        </label>

        {error && <p className="text-sm text-red-500 md:col-span-2">{error}</p>}

        <div className="md:col-span-2 flex gap-2">
          <button type="submit" className="bg-stone-800 text-white px-6 py-2 rounded-lg hover:bg-stone-900">
            {editingId ? '수정 완료' : '상품 등록'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-6 py-2 rounded-lg border border-stone-300">
              취소
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-stone-400">불러오는 중...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-stone-500 border-b border-stone-200">
                <th className="py-2 pr-4">이미지</th>
                <th className="py-2 pr-4">상품명</th>
                <th className="py-2 pr-4">가격</th>
                <th className="py-2 pr-4">재고</th>
                <th className="py-2 pr-4">관리</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-stone-100">
                  <td className="py-2 pr-4">
                    <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
                  </td>
                  <td className="py-2 pr-4">{p.name}</td>
                  <td className="py-2 pr-4">{Number(p.price).toLocaleString()}원</td>
                  <td className="py-2 pr-4">{p.stock}</td>
                  <td className="py-2 pr-4 flex gap-2">
                    <button onClick={() => handleEdit(p)} className="text-khaki-600 hover:underline">
                      수정
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
