'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const CATEGORIES = [
  { slug: 'tops', name: '상의' },
  { slug: 'bottoms', name: '하의' },
  { slug: 'hats', name: '모자' },
  { slug: 'outer', name: '겉옷' },
  { slug: 'socks', name: '양말' },
];

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    fetch('/api/cart')
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((d) => setCartCount((d.items || []).reduce((sum, i) => sum + i.quantity, 0)))
      .catch(() => setCartCount(0));
  }, [user, pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-stone-50/90 backdrop-blur shadow-sm' : 'bg-stone-50'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-stone-900">
          STREET<span className="text-khaki-500">.WEAR</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="hover:text-stone-900 transition-colors py-2">의류</button>
            <div
              className={`absolute left-1/2 -translate-x-1/2 top-full pt-2 transition-all duration-200 ${
                dropdownOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'
              }`}
            >
              <ul className="w-40 bg-white border border-stone-200 rounded-lg shadow-lg py-2">
                {CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/clothes/${c.slug}`}
                      className="block px-4 py-2 text-stone-700 hover:bg-khaki-50 hover:text-khaki-700 transition-colors"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link href="/reviews" className="hover:text-stone-900 transition-colors">리뷰</Link>
          <Link href="/faq" className="hover:text-stone-900 transition-colors">FAQ</Link>
          {user?.role === 'admin' && (
            <Link href="/admin/products" className="hover:text-stone-900 transition-colors">상품관리</Link>
          )}
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/cart" className="relative text-stone-600 hover:text-stone-900">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-khaki-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link href="/mypage" className="text-stone-600 hover:text-stone-900">
                {user.name}님
              </Link>
              <button onClick={handleLogout} className="text-stone-500 hover:text-stone-900">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-stone-600 hover:text-stone-900">로그인</Link>
              <Link
                href="/signup"
                className="bg-khaki-500 text-white px-4 py-1.5 rounded-full hover:bg-khaki-600 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
