export function RestaurantSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Spice Garden",
    "image": "https://spice-garden-49.vercel.app/hero-image.jpg", // Replace with valid image
    "url": "https://spice-garden-49.vercel.app/", // Replace with deployed domain
    "telephone": "+918095111100", // Extracted assuming a dummy or known value. Adjust if necessary
    "servesCuisine": "Indian, Chinese",
    "sameAs": [
      "https://www.instagram.com/spicegarrden?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      "https://www.facebook.com/spicegarrdengokak"
    ],
    "hasMap": "https://www.google.com/maps/place/spice+garden+gokak/data=!4m2!3m1!1s0x3bc0afe5a7f90475:0xad7ff480e09026e3?sa=X&ved=1t:242&ictx=111",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Gokak",
      "addressRegion": "Karnataka",
      "addressCountry": "IN"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "11:00",
        "closes": "23:00"
      }
    ]
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
