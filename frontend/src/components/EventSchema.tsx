interface EventSchemaProps {
  event: {
    title: string;
    description: string;
    date: string; // ISO date string or valid format
    image?: string;
    locationName?: string;
    locationAddress?: string;
  };
}

export function EventSchema({ event }: EventSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.date,
    "image": event.image || "https://spicegarden-gokak.com/og-image.jpg",
    "location": {
      "@type": "Place",
      "name": event.locationName || "Spice Garden",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": event.locationAddress || "Gokak",
        "addressLocality": "Gokak",
        "addressRegion": "Karnataka",
        "addressCountry": "IN"
      }
    }
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
