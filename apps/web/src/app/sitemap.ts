import { MetadataRoute } from 'next';

const BASE = 'https://yeshinnorbu.se';

const staticPages = [
  '', 'program', 'events', 'blog', 'om-oss', 'kontakt', 'stod-oss',
  'besok-oss', 'forsta-besoket', 'bli-medlem', 'donera', 'bli-volontar',
  'lokalhyra', 'integritetspolicy', 'nyhetsbrev', 'shop',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Static pages in both locales
  const pages: MetadataRoute.Sitemap = [];
  for (const page of staticPages) {
    const path = page ? `/${page}` : '';
    pages.push(
      { url: `${BASE}/sv${path}`, lastModified: now, changeFrequency: 'weekly', priority: page === '' ? 1.0 : 0.8,
        alternates: { languages: { sv: `${BASE}/sv${path}`, en: `${BASE}/en${path}` } } },
    );
  }

  // Dynamic events from DB
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const { rows: events } = await pool.query(
      "SELECT slug, updated_at FROM events WHERE published = true AND slug IS NOT NULL ORDER BY starts_at DESC LIMIT 200"
    );
    for (const e of events) {
      pages.push({
        url: `${BASE}/sv/events/${e.slug}`,
        lastModified: e.updated_at || now,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: { languages: { sv: `${BASE}/sv/events/${e.slug}`, en: `${BASE}/en/events/${e.slug}` } },
      });
    }

    // Blog posts
    const { rows: posts } = await pool.query(
      "SELECT slug, updated_at FROM posts WHERE published = true AND slug IS NOT NULL ORDER BY published_at DESC LIMIT 100"
    );
    for (const p of posts) {
      pages.push({
        url: `${BASE}/sv/blog/${p.slug}`,
        lastModified: p.updated_at || now,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages: { sv: `${BASE}/sv/blog/${p.slug}`, en: `${BASE}/en/blog/${p.slug}` } },
      });
    }

    // CMS pages
    const { rows: cmsPages } = await pool.query(
      "SELECT slug, updated_at FROM pages WHERE status = 'published' AND slug IS NOT NULL"
    );
    for (const cp of cmsPages) {
      pages.push({
        url: `${BASE}/sv/${cp.slug}`,
        lastModified: cp.updated_at || now,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages: { sv: `${BASE}/sv/${cp.slug}`, en: `${BASE}/en/${cp.slug}` } },
      });
    }

    await pool.end();
  } catch (e) {
    // DB not available — still return static pages
  }

  return pages;
}
