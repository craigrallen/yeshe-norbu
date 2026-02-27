import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

/** Payload CMS v3 configuration for Yeshe Norbu admin. */
export default buildConfig({
  admin: {
    user: 'admins',
  },
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL! },
  }),
  collections: [
    {
      slug: 'admins',
      auth: true,
      fields: [
        { name: 'role', type: 'select', options: ['admin', 'editor', 'finance', 'support'], required: true },
      ],
    },
    {
      slug: 'pages',
      fields: [
        { name: 'titleSv', type: 'text', required: true, label: 'Titel (svenska)' },
        { name: 'titleEn', type: 'text', required: true, label: 'Title (English)' },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'contentSv', type: 'richText', label: 'Innehåll (svenska)' },
        { name: 'contentEn', type: 'richText', label: 'Content (English)' },
        { name: 'metaDescriptionSv', type: 'textarea', label: 'Meta (svenska)' },
        { name: 'metaDescriptionEn', type: 'textarea', label: 'Meta (English)' },
        { name: 'published', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      slug: 'posts',
      fields: [
        { name: 'titleSv', type: 'text', required: true },
        { name: 'titleEn', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'contentSv', type: 'richText' },
        { name: 'contentEn', type: 'richText' },
        { name: 'featuredImage', type: 'upload', relationTo: 'media' },
        { name: 'published', type: 'checkbox', defaultValue: false },
        { name: 'publishedAt', type: 'date' },
      ],
    },
    {
      slug: 'events',
      fields: [
        { name: 'titleSv', type: 'text', required: true },
        { name: 'titleEn', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'descriptionSv', type: 'richText' },
        { name: 'descriptionEn', type: 'richText' },
        { name: 'category', type: 'text' },
        { name: 'startsAt', type: 'date', required: true },
        { name: 'endsAt', type: 'date' },
        { name: 'venue', type: 'text' },
        { name: 'isOnline', type: 'checkbox', defaultValue: false },
        { name: 'featuredImage', type: 'upload', relationTo: 'media' },
        { name: 'published', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      slug: 'media',
      upload: {
        staticDir: '../media',
        mimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
      },
      fields: [
        { name: 'altTextSv', type: 'text' },
        { name: 'altTextEn', type: 'text' },
      ],
    },
    {
      slug: 'teachers',
      fields: [
        { name: 'nameSv', type: 'text', required: true },
        { name: 'nameEn', type: 'text', required: true },
        { name: 'bioSv', type: 'richText' },
        { name: 'bioEn', type: 'richText' },
        { name: 'photo', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
  globals: [
    {
      slug: 'site-settings',
      fields: [
        { name: 'siteName', type: 'text', defaultValue: 'Yeshe Norbu' },
        { name: 'taglineSv', type: 'text' },
        { name: 'taglineEn', type: 'text' },
        { name: 'footerTextSv', type: 'textarea' },
        { name: 'footerTextEn', type: 'textarea' },
        { name: 'socialLinks', type: 'array', fields: [
          { name: 'platform', type: 'text' },
          { name: 'url', type: 'text' },
        ]},
      ],
    },
  ],
});
