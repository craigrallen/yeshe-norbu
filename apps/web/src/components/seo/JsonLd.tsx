export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Yeshin Norbu Meditationscenter",
    "alternateName": "Yeshin Norbu Meditation Centre",
    "url": "https://yeshinnorbu.se",
    "logo": "https://yeshinnorbu.se/brand/logo-full.png",
    "image": "https://yeshinnorbu.se/brand/church-01.jpg",
    "description": "Meditation, mindfulness och buddhistisk filosofi i hjärtat av Stockholm. Non-profit meditationscenter affilierat med FPMT.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Roslagsgatan 62",
      "addressLocality": "Stockholm",
      "addressCountry": "SE"
    },
    "telephone": "+46855008575",
    "email": "info@yeshinnorbu.se",
    "sameAs": [],
    "memberOf": {
      "@type": "Organization",
      "name": "FPMT - Foundation for the Preservation of the Mahayana Tradition",
      "url": "https://fpmt.org"
    },
    "nonprofitStatus": "NonprofitType"
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function EventJsonLd({ event, locale }: { event: any; locale: string }) {
  const sv = locale === 'sv';
  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": sv ? event.title : event.title_en,
    "startDate": event.starts_at,
    "endDate": event.ends_at || undefined,
    "location": {
      "@type": "Place",
      "name": event.venue || "Yeshin Norbu Meditationscenter",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Roslagsgatan 62",
        "addressLocality": "Stockholm",
        "addressCountry": "SE"
      }
    },
    "image": event.featured_image_url || "https://yeshinnorbu.se/brand/church-01.jpg",
    "description": sv ? event.description_sv : event.description_en,
    "organizer": {
      "@type": "Organization",
      "name": "Yeshin Norbu Meditationscenter",
      "url": "https://yeshinnorbu.se"
    },
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "url": `https://yeshinnorbu.se/${locale}/events/${event.slug}`,
    "inLanguage": locale === 'sv' ? 'sv-SE' : 'en',
  };
  if (event.price_sek) {
    (data as any).offers = {
      "@type": "Offer",
      "price": event.price_sek,
      "priceCurrency": "SEK",
      "availability": "https://schema.org/InStock",
      "url": `https://yeshinnorbu.se/${locale}/events/${event.slug}`,
    };
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
