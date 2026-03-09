import { Toaster } from 'react-hot-toast';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster position="top-center" />
      <Header />
      {children}
      <Footer />
    </>
  );
}
