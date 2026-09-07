import type { Metadata } from 'next';
import { money } from '../../../lib/format';
import { dayLabel } from '../../../lib/labels';
import { InviteClient } from './invite-client';

// SSR/crawlers (preview do WhatsApp) falam com a api por dentro do cluster;
// no browser continua NEXT_PUBLIC_API_URL (/api). Em dev, ambos caem no :3001.
const API_INTERNAL = process.env.API_URL_INTERNAL ?? 'http://localhost:3001/api';

interface InviteSummary {
  eventName: string;
  eventDay: string;
  startTime: string;
  endTime: string;
  eventCity: string;
  perAdult: number;
  guests: number;
  organizer: string;
}

async function fetchInvite(slug: string): Promise<InviteSummary | null> {
  try {
    const res = await fetch(`${API_INTERNAL}/public/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as InviteSummary;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const invite = await fetchInvite(slug);
  if (!invite) {
    return { title: 'Convite não encontrado', robots: { index: false } };
  }
  const title = `${invite.eventName} — você foi convidado! 🍖`;
  const description = `${dayLabel(invite.eventDay)} · começa ${invite.startTime} · ${invite.eventCity}. Sua parte: ${money(invite.perAdult)} — confirme presença e pague no Pix. Organizado por ${invite.organizer}.`;
  return {
    title,
    description,
    openGraph: {
      type: 'website',
      siteName: 'churrasqu.in',
      locale: 'pt_BR',
      url: `/c/${slug}`,
      title,
      description,
      images: [
        {
          url: '/assets/og.jpg',
          width: 1200,
          height: 630,
          alt: `Convite: ${invite.eventName}`,
        },
      ],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function PublicInvitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <InviteClient slug={slug} />;
}
