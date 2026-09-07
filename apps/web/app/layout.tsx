import type { Metadata } from 'next';
import { Bangers, Nunito } from 'next/font/google';
import './globals.css';

const bangers = Bangers({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bangers',
});

const nunito = Nunito({
  weight: ['400', '600', '700', '900'],
  subsets: ['latin'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'churrasqu.in — Calculadora de Churrasco',
  description: 'Ninguém paga a mais. Ninguém passa fome.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bangers.variable} ${nunito.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
