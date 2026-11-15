import { aed, statusCards, type CardSpec } from '@/components/organisms/ReportCards';

/** Report cards for the config-driven catalogue / content lists (key = RESOURCES key). */
const sum = (items: any[], f: (x: any) => number) => items.reduce((s, x) => s + (Number(f(x)) || 0), 0);
const avg = (items: any[], f: (x: any) => number) => { const v = items.map(f).filter((n) => Number(n) > 0); return v.length ? sum(v, Number) / v.length : 0; };
const thisMonth = (items: any[], key = 'createdAt') => { const d = new Date(); return items.filter((x) => { const t = new Date(x[key]); return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth(); }).length; };
const publishCards = (noun: string): CardSpec[] => statusCards(['PUBLISHED', 'DRAFT', 'PENDING_REVIEW', 'ARCHIVED'], { totalLabel: `Total ${noun}` });

export const RESOURCE_CARDS: Record<string, CardSpec[]> = {
  tours: publishCards('tours'),
  packages: [
    ...publishCards('packages').slice(0, 3),
    { label: 'Featured', icon: 'star', tone: 'violet', query: 'featured=true' },
  ],
  hotels: [
    { label: 'Total hotels', icon: 'bed', tone: 'indigo', query: '' },
    { label: 'Published', icon: 'check', tone: 'emerald', query: 'status=PUBLISHED' },
    { label: 'Featured', icon: 'star', tone: 'violet', query: 'featured=true' },
    { label: '5-star', icon: 'star', tone: 'amber', query: 'stars=5' },
  ],
  transfers: [
    { label: 'Total transfers', icon: 'car', tone: 'indigo', query: '' },
    { label: 'Published', icon: 'check', tone: 'emerald', query: 'status=PUBLISHED' },
    { label: 'Draft', icon: 'clock', tone: 'amber', query: 'status=DRAFT' },
    { label: 'Average price', icon: 'tag', tone: 'teal', compute: (i) => avg(i, (x) => x.priceFrom ?? x.price), format: aed },
  ],
  emirates: [
    { label: 'Emirates', icon: 'pin', tone: 'indigo', query: '' },
    { label: 'Destinations', icon: 'compass', tone: 'teal', compute: (i) => sum(i, (x) => x._count?.destinations) },
    { label: 'With hero image', icon: 'upload', tone: 'emerald', compute: (i) => i.filter((x) => x.heroImage).length },
    { label: 'Missing description', icon: 'clock', tone: 'amber', compute: (i) => i.filter((x) => !x.description).length },
  ],
  destinations: [
    { label: 'Destinations', icon: 'compass', tone: 'indigo', query: '' },
    { label: 'Popular', icon: 'star', tone: 'violet', query: 'popular=true' },
    { label: 'With image', icon: 'upload', tone: 'emerald', compute: (i) => i.filter((x) => x.image).length },
    { label: 'Missing description', icon: 'clock', tone: 'amber', compute: (i) => i.filter((x) => !x.description).length },
  ],
  attractions: [
    { label: 'Attractions', icon: 'ticket', tone: 'indigo', query: '' },
    { label: 'Top attractions', icon: 'star', tone: 'violet', query: 'top=true' },
    { label: 'Average ticket', icon: 'tag', tone: 'teal', compute: (i) => avg(i, (x) => x.ticketPrice), format: aed },
    { label: 'Free entry', icon: 'gift', tone: 'emerald', compute: (i) => i.filter((x) => !Number(x.ticketPrice)).length },
  ],
  categories: [
    { label: 'Categories', icon: 'filter', tone: 'indigo', query: '' },
    { label: 'Tours in categories', icon: 'compass', tone: 'teal', compute: (i) => sum(i, (x) => x._count?.tours) },
    { label: 'Empty categories', icon: 'clock', tone: 'amber', compute: (i) => i.filter((x) => !x._count?.tours).length },
    { label: 'With image', icon: 'upload', tone: 'emerald', compute: (i) => i.filter((x) => x.image).length },
  ],
  offers: [
    { label: 'Total offers', icon: 'tag', tone: 'indigo', query: '' },
    { label: 'Published', icon: 'check', tone: 'emerald', query: 'status=PUBLISHED' },
    { label: 'Draft', icon: 'clock', tone: 'amber', query: 'status=DRAFT' },
    { label: 'Expired', icon: 'close', tone: 'rose', compute: (i) => i.filter((x) => x.validTo && new Date(x.validTo) < new Date()).length },
  ],
  blog: publishCards('articles'),
  pages: publishCards('pages'),
  faqs: [
    { label: 'Total FAQs', icon: 'chat', tone: 'indigo', query: '' },
    { label: 'Published', icon: 'check', tone: 'emerald', compute: (i) => i.filter((x) => x.published).length },
    { label: 'Hidden', icon: 'eye-off', tone: 'rose', compute: (i) => i.filter((x) => !x.published).length },
    { label: 'Categories', icon: 'filter', tone: 'teal', compute: (i) => new Set(i.map((x) => x.category)).size },
  ],
  inquiries: statusCards(['NEW', 'IN_PROGRESS', 'CLOSED'], { totalLabel: 'Total inquiries' }),
  subscribers: [
    { label: 'Subscribers', icon: 'mail', tone: 'indigo', query: '' },
    { label: 'New this month', icon: 'calendar', tone: 'emerald', compute: (i) => thisMonth(i) },
  ],
};
