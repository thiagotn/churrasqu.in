import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  themeColor: '#F2E6D0',
  colorScheme: 'only light',
};

const DESCRIPTION =
  'Monte o churras e divida a conta: lista de compras por padrão ($, $$, $$$), link de convite com QR Code e Pix para o rateio. Ninguém paga a mais. Ninguém passa fome.';

export const metadata: Metadata = {
  metadataBase: new URL('https://churrasqu.in'),
  title: {
    default: 'churrasqu.in — Calculadora de Churrasco',
    template: '%s · churrasqu.in',
  },
  description: DESCRIPTION,
  icons: { icon: '/assets/logo.png' },
  // Preview de link (WhatsApp/Telegram/redes usam Open Graph)
  openGraph: {
    type: 'website',
    siteName: 'churrasqu.in',
    locale: 'pt_BR',
    url: '/',
    title: 'churrasqu.in — Calculadora de Churrasco',
    description: DESCRIPTION,
    images: [
      {
        url: '/assets/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Churrasco no quintal — churrasqu.in',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bangers.variable} ${nunito.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
