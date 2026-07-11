import { getProductById, listReviews } from '@/lib/store';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';
import AddToCartButton from '@/components/AddToCartButton';

const CATEGORY_MAP = {
  tops: '상의',
  bottoms: '하의',
  hats: '모자',
  outer: '겉옷',
  socks: '양말',
};

export default function ProductDetailPage({ params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const product = getProductById(id);
  if (!product || !product.is_active) notFound();

  const reviews = listReviews({ productId: id });

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <nav className="text-sm text-stone-400 mb-8">
        <Link href="/" className="hover:text-stone-600">홈</Link>
        <span className="mx-2">/</span>
        <Link href={`/clothes/${product.category}`} className="hover:text-stone-600">
          {CATEGORY_MAP[product.category] || product.category}
        </Link>
      </nav>

      <ScrollReveal>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div>
            <p className="text-khaki-600 text-sm font-medium mb-2">{CATEGORY_MAP[product.category]}</p>
            <h1 className="text-2xl font-bold text-stone-900 mb-3">{product.name}</h1>
            <p className="text-xl font-semibold text-stone-800 mb-6">{product.price.toLocaleString()}원</p>
            <p className="text-stone-500 leading-relaxed mb-8 whitespace-pre-line">
              {product.description || '상품 설명이 없습니다.'}
            </p>

            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="mt-20">
          <h2 className="text-xl font-bold text-stone-900 mb-6">리뷰 ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-stone-400">아직 등록된 리뷰가 없습니다.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="border border-stone-200 rounded-xl p-5 bg-white">
                  <div className="flex justify-between text-sm text-stone-500 mb-1">
                    <span>{r.user_name}</span>
                    <span>{'⭐'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-stone-800">{r.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
