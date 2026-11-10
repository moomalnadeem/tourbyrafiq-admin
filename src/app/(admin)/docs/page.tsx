import { ButtonLink } from '@/components/atoms';
import { Card, PageTitle } from '@/components/organisms/Widgets';

/** AD46–AD53 · Docs & tutorials (opens the technical documentation site). */
export default function Docs() {
  const base = process.env.NEXT_PUBLIC_DOCS_URL ?? 'http://localhost:3002';
  const items: [string, string, string][] = [['Admin guide', 'Bookings, catalogue, content, people and finance — step by step.', '/guides/admin'], ['Website guide', 'How pages, booking and accounts work for guests.', '/guides/website'], ['Mobile app guide', 'Explore, trips, saved and profile in the app.', '/guides/mobile'], ['Architecture & security', 'Microservices, BFF, authentication, bot protection.', '/architecture']];
  return (
    <>
      <PageTitle title="Docs & tutorials" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {items.map(([t, d, href]) => <Card key={t} style={{ display: 'grid', gap: 10 }}><strong style={{ fontFamily: 'var(--f-serif)', fontSize: 20, fontWeight: 400 }}>{t}</strong><p style={{ color: 'var(--c-muted)', fontSize: 14 }}>{d}</p><ButtonLink href={`${base}${href}`} external variant="outline" icon="arrow-up-right">Open</ButtonLink></Card>)}
      </div>
    </>
  );
}
