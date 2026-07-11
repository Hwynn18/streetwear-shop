export default function Footer() {
  return (
    <footer className="bg-stone-800 text-stone-300 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 text-sm flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="text-white font-semibold mb-1">STREET.WEAR</p>
          <p>대표: 홍길동 | 사업자등록번호: 000-00-00000</p>
          <p>서울특별시 어딘가 123 | 고객센터 1588-0000</p>
        </div>
        <p className="text-stone-400">&copy; {new Date().getFullYear()} STREET.WEAR. All rights reserved.</p>
      </div>
    </footer>
  );
}
