import { getRequestConfig } from 'next-intl/server';

export const locales = ['sv', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'sv';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  return {
    locale: locale ?? defaultLocale,
    messages: (await import(`../messages/${(locale ?? defaultLocale)}.json`)).default,
  };
});
