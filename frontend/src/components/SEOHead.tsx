import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
}

export function SEOHead({ 
  title, 
  description, 
  url = 'https://spice-garden-49.vercel.app/', // Replace with actual domain 
  image = 'https://spice-garden-49.vercel.app/og-image.jpg' // Replace with actual og image 
}: SEOHeadProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Social Links */}
      <link rel="me" href="https://www.instagram.com/spicegarrden?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" />
      <link rel="me" href="https://www.facebook.com/spicegarrdengokak" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
