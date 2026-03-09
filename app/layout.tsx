import './globals.css';
import { NotificationProvider } from '@/app/components/notification/provider';
import { Cinzel, Libre_Baskerville } from 'next/font/google';

const rusticFont = Cinzel({
  subsets: ['latin'],
  variable: '--font-rustic',
  weight: ['400', '600', '700'],
});

const bodyFont = Libre_Baskerville({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '700'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${rusticFont.variable} ${bodyFont.variable}`}>
      <body className="antialiased bg-wood-light text-ink font-body">
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
