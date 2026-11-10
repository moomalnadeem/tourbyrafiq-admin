import type { IconName } from '@/components/atoms';

/** Mirrors backend ROLE_PERMISSIONS (libs/common/src/security/roles.ts) to hide links a role can't use.
 *  This is UX only — the gateway enforces permissions on every request. */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  EDITOR: ['catalog:read', 'catalog:write', 'content:write', 'media:moderate', 'reviews:moderate'],
  SUPPORT: ['bookings:read', 'bookings:write', 'people:read', 'support:handle', 'reviews:moderate', 'catalog:read'],
  FINANCE: ['bookings:read', 'payments:read', 'refunds:decide', 'finance:payouts', 'people:read'],
  ADMIN: ['bookings:read', 'bookings:write', 'payments:read', 'refunds:decide', 'catalog:read', 'catalog:write', 'content:write', 'media:moderate', 'people:read', 'people:write', 'reviews:moderate', 'support:handle', 'finance:payouts', 'system:settings', 'audit:read'],
  SUPER_ADMIN: ['*'],
};
export const can = (role: string | undefined, perm?: string) => !perm || ROLE_PERMISSIONS[role ?? '']?.some((p) => p === '*' || p === perm);

export interface NavItem { href: string; label: string; icon: IconName; perm?: string }
export const ADMIN_NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Overview', items: [{ href: '/', label: 'Dashboard', icon: 'home', perm: 'bookings:read' }] },
  { group: 'Sales', items: [
    { href: '/bookings', label: 'Bookings', icon: 'ticket', perm: 'bookings:read' },
    { href: '/payments', label: 'Payments', icon: 'tag', perm: 'payments:read' },
    { href: '/refunds', label: 'Refunds & cancellations', icon: 'arrow-up-right', perm: 'payments:read' },
    { href: '/promo-codes', label: 'Promo codes', icon: 'gift', perm: 'bookings:read' },
  ] },
  { group: 'Catalogue', items: [
    { href: '/catalog/tours', label: 'Tours & activities', icon: 'compass', perm: 'catalog:read' },
    { href: '/catalog/packages', label: 'Packages', icon: 'gift', perm: 'catalog:read' },
    { href: '/catalog/hotels', label: 'Hotels', icon: 'bed', perm: 'catalog:read' },
    { href: '/catalog/transfers', label: 'Transfers', icon: 'car', perm: 'catalog:read' },
    { href: '/availability', label: 'Availability & pricing', icon: 'calendar', perm: 'catalog:write' },
    { href: '/catalog/emirates', label: 'Emirates', icon: 'pin', perm: 'catalog:read' },
    { href: '/catalog/destinations', label: 'Destinations', icon: 'pin', perm: 'catalog:read' },
    { href: '/catalog/attractions', label: 'Attractions', icon: 'ticket', perm: 'catalog:read' },
    { href: '/catalog/categories', label: 'Categories', icon: 'filter', perm: 'catalog:read' },
    { href: '/catalog/offers', label: 'Offers', icon: 'tag', perm: 'catalog:read' },
  ] },
  { group: 'Content', items: [
    { href: '/content/pages', label: 'Pages', icon: 'copy', perm: 'content:write' },
    { href: '/content/blog', label: 'Blog', icon: 'chat', perm: 'content:write' },
    { href: '/media', label: 'Media library', icon: 'upload', perm: 'media:moderate' },
    { href: '/content/faqs', label: 'FAQs', icon: 'globe', perm: 'content:write' },
    { href: '/content/inquiries', label: 'Inquiries', icon: 'mail', perm: 'content:write' },
  ] },
  { group: 'People', items: [
    { href: '/customers', label: 'Customers', icon: 'user', perm: 'people:read' },
    { href: '/guides', label: 'Guides', icon: 'users', perm: 'people:read' },
    { href: '/reviews', label: 'Reviews', icon: 'star', perm: 'reviews:moderate' },
    { href: '/support', label: 'Support inbox', icon: 'chat', perm: 'support:handle' },
  ] },
  { group: 'Finance', items: [{ href: '/payouts', label: 'Payouts', icon: 'tag', perm: 'finance:payouts' }] },
  { group: 'System', items: [
    { href: '/email-templates', label: 'Email & notifications', icon: 'mail', perm: 'system:settings' },
    { href: '/staff', label: 'Users & roles', icon: 'shield', perm: 'system:roles' },
    { href: '/permissions', label: 'Permission matrix', icon: 'shield', perm: 'system:roles' },
    { href: '/settings', label: 'Settings', icon: 'filter', perm: 'system:settings' },
    { href: '/audit-log', label: 'Audit log', icon: 'copy', perm: 'audit:read' },
    { href: '/login-history', label: 'Login history', icon: 'logout', perm: 'audit:read' },
    { href: '/docs', label: 'Docs & tutorials', icon: 'globe' },
  ] },
];

export const GUIDE_NAV: NavItem[] = [
  { href: '/guide', label: 'Dashboard', icon: 'home' },
  { href: '/guide/orders', label: 'Orders', icon: 'ticket' },
  { href: '/guide/tours', label: 'My tours', icon: 'compass' },
  { href: '/guide/media', label: 'Media library', icon: 'upload' },
  { href: '/guide/profile', label: 'Profile editor', icon: 'user' },
  { href: '/guide/earnings', label: 'Earnings', icon: 'tag' },
];
