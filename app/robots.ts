import { MetadataRoute } from 'next';
import { brandConfig } from '@/config/brand.config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = brandConfig.seo.siteUrl.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
