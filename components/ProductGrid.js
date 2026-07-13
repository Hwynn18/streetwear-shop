import ProductCard from './ProductCard';
import ScrollReveal from './ScrollReveal';
import Link from 'next/link';

export default function ProductGrid({ products, fixedColumns = false }) {
  if (!products || products.length === 0) {
    return <p className="text-center text-stone-400 py-20">등록된 상품이 없습니다.</p>;
  }
  const gridClass = fixedColumns
    ? 'grid grid-cols-4 gap-x-2 sm:gap-x-4 md:gap-x-6 gap-y-4 sm:gap-y-6 md:gap-y-10'
    : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10';

  return (

    <div className={gridClass}>
      {products.map((product, idx) => (
        <ScrollReveal key={product.id} delay={(idx % 8) * 60}>
          <Link href={`/clothes/product/${product.id}`}>
            <ProductCard product={product} />
          </Link>
        </ScrollReveal>
      ))}
    </div>
  );
}
