import { Toaster } from 'react-hot-toast';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
        }}
      />

      {/* Header */}
      <Header />

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
