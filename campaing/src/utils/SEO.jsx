import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * SEO Component for standardizing metadata and social tags across the application.
 */




const SEO = ({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage,
  twitterCard = "summary_large_image",
  jsonLd,
  children,
}) => {
  const siteName = "SiasaHub";
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Your Political Campaign Command Center`;
  const defaultDescription = "SiasaHub is Kenya's leading   digital  campaing   Agency for   political campaign command center. Track leaders, manifestos, and real-time voter engagement for the 2027 General Election.";
  const defaultOgImage = "/icons/og-image.png";
  const baseUrl = "https://siasahub.co.ke";

  const fullCanonical = canonical
    ? (canonical.startsWith("http") ? canonical : `${baseUrl}${canonical}`)
    : baseUrl;

  const resolvedOgImage = ogImage
    ? (ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`)
    : `${baseUrl}${defaultOgImage}`;

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {canonical && <link rel="canonical" href={fullCanonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}

      {/* Custom tags passed as children */}
      {children}
    </Helmet>
  );
};

export default SEO;
