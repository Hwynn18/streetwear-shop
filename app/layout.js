import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'STREET.WEAR | 스트릿 캐주얼',
  description: '카키 & 그레이 톤의 편안한 스트릿 캐주얼 셀렉트샵',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
