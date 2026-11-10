/**
 * Config-driven admin. Every catalogue/content screen (AD7–AD22) is generated from these schemas by
 * the reusable ResourceTable + ResourceForm organisms. Add a field here → it appears in list + form.
 */
export type FieldType = 'text' | 'textarea' | 'markdown' | 'number' | 'money' | 'select' | 'boolean' | 'tags' | 'image' | 'images' | 'date' | 'relation' | 'json';
export interface Field {
  key: string; label: string; type: FieldType; required?: boolean; options?: string[]; hint?: string;
  relation?: { path: string; labelKey?: string }; folder?: string; full?: boolean;
}
export type ColumnRender = 'text' | 'money' | 'status' | 'date' | 'image' | 'bool' | 'count';
export interface Column { key: string; label: string; render?: ColumnRender }
export interface ResourceConfig {
  key: string; title: string; singular: string; api: string; group: 'catalog' | 'content';
  columns: Column[]; fields: Field[]; statusFilter?: string[]; readOnly?: boolean; code: string;
}

const STATUS = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'];
const seo: Field[] = [{ key: 'seoTitle', label: 'SEO title', type: 'text' }, { key: 'seoDescription', label: 'SEO description', type: 'textarea' }];

export const RESOURCES: Record<string, ResourceConfig> = {
  tours: {
    key: 'tours', title: 'Tours & activities', singular: 'tour', api: 'admin/catalog/tours', group: 'catalog', code: 'AD7', statusFilter: STATUS,
    columns: [{ key: 'images', label: '', render: 'image' }, { key: 'title', label: 'Tour' }, { key: 'locationLabel', label: 'Category · location' }, { key: 'priceFrom', label: 'From', render: 'money' }, { key: 'rating', label: 'Rating' }, { key: 'status', label: 'Status', render: 'status' }],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, full: true },
      { key: 'slug', label: 'URL slug', type: 'text', hint: 'Leave empty to generate from title' },
      { key: 'status', label: 'Status', type: 'select', options: STATUS },
      { key: 'emirateId', label: 'Emirate', type: 'relation', relation: { path: 'catalog/emirates' } },
      { key: 'categoryId', label: 'Category', type: 'relation', relation: { path: 'catalog/categories' } },
      { key: 'locationLabel', label: 'Card label', type: 'text', hint: 'e.g. Desert safari · Dubai' },
      { key: 'badge', label: 'Badge', type: 'text', hint: 'Best seller, New, Top rated…' },
      { key: 'priceFrom', label: 'Adult price (AED)', type: 'money', required: true },
      { key: 'childPrice', label: 'Child price (AED)', type: 'money' },
      { key: 'durationHours', label: 'Duration (hours)', type: 'number' },
      { key: 'maxGuests', label: 'Max guests', type: 'number' },
      { key: 'tourType', label: 'Type', type: 'select', options: ['PRIVATE', 'SHARED'] },
      { key: 'season', label: 'Season', type: 'select', options: ['', 'winter', 'spring', 'summer'] },
      { key: 'isBestSeller', label: 'Best seller', type: 'boolean' },
      { key: 'isFeatured', label: 'Featured', type: 'boolean' },
      { key: 'isRecommended', label: 'Recommended', type: 'boolean' },
      { key: 'images', label: 'Photos', type: 'images', folder: 'tours', full: true },
      { key: 'summary', label: 'Summary', type: 'textarea', full: true },
      { key: 'description', label: 'Description', type: 'textarea', full: true },
      { key: 'highlights', label: 'Highlights', type: 'tags', full: true },
      { key: 'inclusions', label: 'Included', type: 'tags' },
      { key: 'exclusions', label: 'Not included', type: 'tags' },
      { key: 'languages', label: 'Languages', type: 'tags' },
      { key: 'meetingPoint', label: 'Meeting point', type: 'text' },
      { key: 'itinerary', label: 'Itinerary (JSON)', type: 'json', full: true, hint: '[{"time":"3:30 PM","title":"Pickup","body":"…"}]' },
      ...seo,
    ],
  },
  packages: {
    key: 'packages', title: 'Packages', singular: 'package', api: 'admin/catalog/packages', group: 'catalog', code: 'AD8', statusFilter: STATUS,
    columns: [{ key: 'images', label: '', render: 'image' }, { key: 'title', label: 'Package' }, { key: 'segment', label: 'Type' }, { key: 'days', label: 'Days' }, { key: 'priceFrom', label: 'From', render: 'money' }, { key: 'status', label: 'Status', render: 'status' }],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, full: true }, { key: 'slug', label: 'URL slug', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: STATUS },
      { key: 'segment', label: 'Type', type: 'select', options: ['INBOUND', 'DOMESTIC', 'LUXURY', 'FAMILY', 'HONEYMOON', 'GROUP', 'WEEKEND'] },
      { key: 'days', label: 'Days', type: 'number' }, { key: 'nights', label: 'Nights', type: 'number' },
      { key: 'priceFrom', label: 'Price per person (AED)', type: 'money', required: true }, { key: 'badge', label: 'Badge', type: 'text' },
      { key: 'isFeatured', label: 'Featured', type: 'boolean' },
      { key: 'images', label: 'Photos', type: 'images', folder: 'packages', full: true },
      { key: 'summary', label: 'Summary', type: 'textarea', full: true },
      { key: 'inclusions', label: 'Included', type: 'tags' }, { key: 'exclusions', label: 'Not included', type: 'tags' },
      { key: 'itinerary', label: 'Day-by-day (JSON)', type: 'json', full: true, hint: '[{"day":1,"title":"Arrival","body":"…"}]' },
    ],
  },
  hotels: {
    key: 'hotels', title: 'Hotels', singular: 'hotel', api: 'admin/catalog/hotels', group: 'catalog', code: 'AD9', statusFilter: STATUS,
    columns: [{ key: 'images', label: '', render: 'image' }, { key: 'name', label: 'Hotel' }, { key: 'stars', label: 'Stars' }, { key: 'priceFrom', label: 'From', render: 'money' }, { key: 'status', label: 'Status', render: 'status' }],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, full: true }, { key: 'status', label: 'Status', type: 'select', options: STATUS },
      { key: 'emirateId', label: 'Emirate', type: 'relation', relation: { path: 'catalog/emirates' } }, { key: 'stars', label: 'Stars', type: 'number' },
      { key: 'priceFrom', label: 'Price per night (AED)', type: 'money', required: true }, { key: 'address', label: 'Address', type: 'text' },
      { key: 'isFeatured', label: 'Featured', type: 'boolean' }, { key: 'amenities', label: 'Amenities', type: 'tags', full: true },
      { key: 'images', label: 'Photos', type: 'images', folder: 'hotels', full: true }, { key: 'summary', label: 'Summary', type: 'textarea', full: true },
    ],
  },
  transfers: {
    key: 'transfers', title: 'Transfers', singular: 'transfer', api: 'admin/catalog/transfers', group: 'catalog', code: 'AD10', statusFilter: STATUS,
    columns: [{ key: 'name', label: 'Transfer' }, { key: 'vehicleType', label: 'Vehicle' }, { key: 'capacity', label: 'Seats' }, { key: 'priceFrom', label: 'From', render: 'money' }, { key: 'status', label: 'Status', render: 'status' }],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, full: true }, { key: 'status', label: 'Status', type: 'select', options: STATUS },
      { key: 'vehicleType', label: 'Vehicle', type: 'select', options: ['Sedan', 'SUV', 'Van', 'Luxury', 'Coach'], required: true },
      { key: 'capacity', label: 'Seats', type: 'number' }, { key: 'luggage', label: 'Luggage', type: 'number' },
      { key: 'fromLocation', label: 'From', type: 'text', required: true }, { key: 'toLocation', label: 'To', type: 'text', required: true },
      { key: 'priceFrom', label: 'Price per vehicle (AED)', type: 'money', required: true }, { key: 'image', label: 'Photo', type: 'image', folder: 'general' },
    ],
  },
  offers: {
    key: 'offers', title: 'Offers', singular: 'offer', api: 'admin/catalog/offers', group: 'catalog', code: 'AD6', statusFilter: STATUS,
    columns: [{ key: 'title', label: 'Offer' }, { key: 'discountPercent', label: '% off' }, { key: 'promoCode', label: 'Code' }, { key: 'validTo', label: 'Valid to', render: 'date' }, { key: 'status', label: 'Status', render: 'status' }],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, full: true }, { key: 'status', label: 'Status', type: 'select', options: STATUS },
      { key: 'discountPercent', label: 'Discount %', type: 'number' }, { key: 'promoCode', label: 'Promo code', type: 'text', hint: 'Create the code in Promo codes too' },
      { key: 'season', label: 'Season', type: 'select', options: ['', 'winter', 'spring', 'summer'] },
      { key: 'validFrom', label: 'Valid from', type: 'date' }, { key: 'validTo', label: 'Valid to', type: 'date' },
      { key: 'image', label: 'Image', type: 'image', folder: 'general' }, { key: 'description', label: 'Description', type: 'textarea', full: true }, { key: 'terms', label: 'Terms', type: 'textarea', full: true },
    ],
  },
  emirates: {
    key: 'emirates', title: 'Emirates', singular: 'emirate', api: 'admin/catalog/emirates', group: 'catalog', code: 'AD12',
    columns: [{ key: 'heroImage', label: '', render: 'image' }, { key: 'name', label: 'Emirate' }, { key: '_count.destinations', label: 'Destinations', render: 'count' }, { key: 'sortOrder', label: 'Order' }],
    fields: [{ key: 'name', label: 'Name', type: 'text', required: true }, { key: 'sortOrder', label: 'Order', type: 'number' }, { key: 'heroImage', label: 'Hero image', type: 'image', folder: 'destinations' }, { key: 'tagline', label: 'Menu card eyebrow', type: 'text', hint: 'Mega menu feature card, e.g. City of superlatives' }, { key: 'menuImage', label: 'Menu card image', type: 'image', folder: 'destinations' }, { key: 'summary', label: 'Summary (menu card line)', type: 'textarea', full: true }, { key: 'description', label: 'Description', type: 'textarea', full: true }, ...seo],
  },
  destinations: {
    key: 'destinations', title: 'Destinations', singular: 'destination', api: 'admin/catalog/destinations', group: 'catalog', code: 'AD12',
    columns: [{ key: 'image', label: '', render: 'image' }, { key: 'name', label: 'Destination' }, { key: 'emirate.name', label: 'Emirate' }, { key: 'isPopular', label: 'Popular', render: 'bool' }],
    fields: [{ key: 'name', label: 'Name', type: 'text', required: true }, { key: 'emirateId', label: 'Emirate', type: 'relation', relation: { path: 'catalog/emirates' }, required: true }, { key: 'isPopular', label: 'Popular', type: 'boolean' }, { key: 'popularRank', label: 'Homepage mosaic position', type: 'number', hint: '1 = large tile, 2–5 = small tiles, empty = hidden' }, { key: 'sortOrder', label: 'Menu order', type: 'number' }, { key: 'image', label: 'Image', type: 'image', folder: 'destinations' }, { key: 'summary', label: 'Summary', type: 'textarea', full: true }, { key: 'description', label: 'Description', type: 'textarea', full: true }],
  },
  attractions: {
    key: 'attractions', title: 'Attractions & tickets', singular: 'attraction', api: 'admin/catalog/attractions', group: 'catalog', code: 'AD12',
    columns: [{ key: 'image', label: '', render: 'image' }, { key: 'name', label: 'Attraction' }, { key: 'destination.name', label: 'Destination' }, { key: 'ticketPrice', label: 'Ticket', render: 'money' }],
    fields: [{ key: 'name', label: 'Name', type: 'text', required: true }, { key: 'destinationId', label: 'Destination', type: 'relation', relation: { path: 'catalog/destinations' }, required: true }, { key: 'ticketPrice', label: 'Ticket price (AED)', type: 'money' }, { key: 'openingHours', label: 'Opening hours', type: 'text' }, { key: 'isTopAttraction', label: 'Top attraction', type: 'boolean' }, { key: 'tag', label: 'Menu tag', type: 'text', hint: 'Seasonal, Coming soon, UNESCO…' }, { key: 'sortOrder', label: 'Menu order', type: 'number' }, { key: 'image', label: 'Image', type: 'image', folder: 'destinations' }, { key: 'summary', label: 'Summary', type: 'textarea', full: true }],
  },
  categories: {
    key: 'categories', title: 'Categories', singular: 'category', api: 'admin/catalog/categories', group: 'catalog', code: 'AD7',
    columns: [{ key: 'name', label: 'Category' }, { key: '_count.tours', label: 'Tours', render: 'count' }, { key: 'sortOrder', label: 'Order' }],
    fields: [{ key: 'name', label: 'Name', type: 'text', required: true }, { key: 'icon', label: 'Icon', type: 'select', options: ['sun', 'building', 'map', 'ship', 'mountain', 'landmark', 'ticket', 'waves'] }, { key: 'sortOrder', label: 'Order', type: 'number' }, { key: 'image', label: 'Image', type: 'image', folder: 'general' }],
  },
  blog: {
    key: 'blog', title: 'Blog', singular: 'article', api: 'admin/content/blog', group: 'content', code: 'AD16', statusFilter: STATUS,
    columns: [{ key: 'coverImage', label: '', render: 'image' }, { key: 'title', label: 'Article' }, { key: 'category', label: 'Category' }, { key: 'publishedAt', label: 'Published', render: 'date' }, { key: 'status', label: 'Status', render: 'status' }],
    fields: [{ key: 'title', label: 'Title', type: 'text', required: true, full: true }, { key: 'slug', label: 'URL slug', type: 'text' }, { key: 'status', label: 'Status', type: 'select', options: STATUS }, { key: 'category', label: 'Category', type: 'select', options: ['Travel tips', 'Destination guides', 'Inspiration', 'News'] }, { key: 'readMinutes', label: 'Read time (min)', type: 'number' }, { key: 'tags', label: 'Tags', type: 'tags' }, { key: 'coverImage', label: 'Cover image', type: 'image', folder: 'blog' }, { key: 'excerpt', label: 'Excerpt', type: 'textarea', full: true }, { key: 'content', label: 'Content (Markdown)', type: 'markdown', required: true, full: true }, ...seo],
  },
  pages: {
    key: 'pages', title: 'Pages', singular: 'page', api: 'admin/content/pages', group: 'content', code: 'AD13', statusFilter: STATUS,
    columns: [{ key: 'title', label: 'Page' }, { key: 'slug', label: 'URL' }, { key: 'updatedAt', label: 'Updated', render: 'date' }, { key: 'status', label: 'Status', render: 'status' }],
    fields: [{ key: 'title', label: 'Title', type: 'text', required: true }, { key: 'slug', label: 'URL slug', type: 'text' }, { key: 'status', label: 'Status', type: 'select', options: STATUS }, { key: 'sections', label: 'Sections (JSON)', type: 'json', full: true, hint: '[{"type":"richText","body":"## Heading\\n\\nText…"}]' }, ...seo],
  },
  faqs: {
    key: 'faqs', title: 'FAQs', singular: 'FAQ', api: 'admin/content/faqs', group: 'content', code: 'AD21',
    columns: [{ key: 'question', label: 'Question' }, { key: 'category', label: 'Category' }, { key: 'sortOrder', label: 'Order' }, { key: 'published', label: 'Live', render: 'bool' }],
    fields: [{ key: 'question', label: 'Question', type: 'text', required: true, full: true }, { key: 'answer', label: 'Answer', type: 'textarea', required: true, full: true }, { key: 'category', label: 'Category', type: 'select', options: ['general', 'booking', 'payment', 'account', 'visa'] }, { key: 'sortOrder', label: 'Order', type: 'number' }, { key: 'published', label: 'Published', type: 'boolean' }],
  },
  inquiries: {
    key: 'inquiries', title: 'Inquiries', singular: 'inquiry', api: 'admin/content/inquiries', group: 'content', code: 'AD27', statusFilter: ['NEW', 'IN_PROGRESS', 'CLOSED'],
    columns: [{ key: 'name', label: 'From' }, { key: 'email', label: 'Email' }, { key: 'type', label: 'Type' }, { key: 'createdAt', label: 'Received', render: 'date' }, { key: 'status', label: 'Status', render: 'status' }],
    fields: [{ key: 'status', label: 'Status', type: 'select', options: ['NEW', 'IN_PROGRESS', 'CLOSED'] }, { key: 'message', label: 'Message', type: 'textarea', full: true }, { key: 'payload', label: 'Form details', type: 'json', full: true }],
  },
  subscribers: {
    key: 'subscribers', title: 'Newsletter subscribers', singular: 'subscriber', api: 'admin/content/subscribers', group: 'content', code: 'AD28', readOnly: true,
    columns: [{ key: 'email', label: 'Email' }, { key: 'createdAt', label: 'Subscribed', render: 'date' }], fields: [],
  },
};
