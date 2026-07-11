import { listProducts } from '@/lib/store';
import ProductGrid from '@/components/ProductGrid';
import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';

function getNewProducts() {
  try {
    return listProducts({}).slice(0, 8);
  } catch (err) {
    console.error('[HOME PRODUCTS ERROR]', err);
    return [];
  }
}

const CATEGORIES = [
  { slug: 'tops', name: '상의' },
  { slug: 'bottoms', name: '하의' },
  { slug: 'outer', name: '겉옷' },
  { slug: 'hats', name: '모자' },
  { slug: 'socks', name: '양말' },
];

export default function HomePage() {
  const newProducts = getNewProducts();

  return (
    <div>
      {/* Hero */}
      <section className="bg-stone-200/60 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-28 text-center">
          <ScrollReveal>
            <p className="text-khaki-600 font-medium tracking-widest text-sm mb-3">EASY STREET CASUAL</p>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 leading-tight">
              힘 빼고 입어도 <br className="md:hidden" /> 완성되는 스트릿 무드
            </h1>
            <p className="mt-5 text-stone-500">카키 &amp; 그레이 톤으로 정리한 데일리 캐주얼 셀렉션</p>
            <Link
              href="/clothes/tops"
              className="inline-block mt-8 bg-stone-800 text-white px-8 py-3 rounded-full hover:bg-stone-900 transition-colors"
            >
              지금 둘러보기
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* 카테고리 */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-stone-900 mb-8">카테고리</h2>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {CATEGORIES.map((c, idx) => (
            <ScrollReveal key={c.slug} delay={idx * 80}>
              <Link
                href={`/clothes/${c.slug}`}
                className="block text-center py-10 rounded-xl bg-white border border-stone-200 hover:border-khaki-400 hover:shadow-md transition-all"
              >
                <span className="text-stone-700 font-medium">{c.name}</span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 신상품 */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-stone-900 mb-8">신상품</h2>
        </ScrollReveal>
        <ProductGrid products={newProducts} />
      </section>
    </div>
  );
}
