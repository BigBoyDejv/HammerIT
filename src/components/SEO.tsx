import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile' | 'job';
  keywords?: string;
}

export function SEO({ 
  title, 
  description, 
  canonical, 
  ogImage, 
  ogType = 'website',
  keywords 
}: SEOProps) {
  const siteTitle = 'HammerIT';
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Špičkoví remeselníci na dosah ruky`;
  
  const defaultDescription = 'Nájdite najlepších remeselníkov na Slovensku. Od elektrikárov po maliarov – overené referencie a férové ceny.';
  const metaDescription = description || defaultDescription;
  
  const siteUrl = 'https://hammerit.sk';
  const currentUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
  
  const defaultOgImage = '/og-image.png';
  const metaOgImage = ogImage || defaultOgImage;

  return (
    <Helmet>
      {/* Základné meta tagy */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaOgImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaOgImage} />
    </Helmet>
  );
}
