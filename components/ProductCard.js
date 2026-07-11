'use client';

export default function ProductCard({ product }) {
  return (
    <div className="group cursor-pointer select-none">
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-stone-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-90"
          loading="lazy"
        />
      </div>

      {/* 평소엔 숨겨져 있다가 호버 시 아래에서 서서히 등장 */}
      <div className="mt-3 max-h-0 opacity-0 overflow-hidden group-hover:max-h-16 group-hover:opacity-100 transition-all duration-300 ease-out">
        <p className="text-sm font-medium text-stone-800 truncate">{product.name}</p>
        <p className="text-sm text-khaki-600 font-semibold">{product.price?.toLocaleString()}원</p>
      </div>
    </div>
  );
}
