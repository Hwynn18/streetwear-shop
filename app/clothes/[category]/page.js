import { listProducts } from '@/lib/store';
import ProductGrid from '@/components/ProductGrid';
import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';

const CATEGORY_MAP = {
  tops: '상의',
  bottoms: '하의',
  hats: '모자',
  outer: '겉옷',
  socks: '양말',
};

function getProducts(category) {
  try {
    return listProducts({ categorySlug: category });
  } catch (err) {
    console.error('[CATEGORY PRODUCTS ERROR]', err);
    return [];
  }
}

export default function CategoryPage({ params }) {
  const { category } = params;
  const categoryName = CATEGORY_MAP[category];

  if (!categoryName) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center text-stone-500">
        존재하지 않는 카테고리입니다.
        <div className="mt-4">
          <Link href="/" className="text-khaki-600 underline">
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const products = getProducts(category);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <ScrollReveal>
        <nav className="flex gap-2 text-sm mb-6">
          {Object.entries(CATEGORY_MAP).map(([slug, name]) => (
            <Link
              key={slug}
              href={`/clothes/${slug}`}
              className={`px-4 py-1.5 rounded-full border transition-colors ${
                slug === category
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'border-stone-300 text-stone-600 hover:border-stone-500'
              }`}
            >
              {name}
            </Link>
          ))}
        </nav>
        <h1 className="text-2xl font-bold text-stone-900 mb-10">{categoryName}</h1>
      </ScrollReveal>

      <ProductGrid products={products} />
    </div>
  );
}
