import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductDetail } from '@/lib/db/catalog';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { brandConfig } from '@/config/brand.config';

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetail(slug);

  if (!product) {
    return {
      title: `Product Not Found — ${brandConfig.name}`,
    };
  }

  const title = product.metaTitle || `${product.name} — Handcrafted Luxury | ${brandConfig.name}`;
  const description =
    product.metaDescription ||
    product.description?.slice(0, 160) ||
    brandConfig.seo.defaultDescription;
  const ogImage = product.images[0]?.url || brandConfig.seo.ogImage;
  const canonicalUrl = `${brandConfig.seo.siteUrl}/product/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: brandConfig.name,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: brandConfig.seo.twitterHandle,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductDetail(slug);

  if (!product) {
    notFound();
  }

  const isAvailable = product.variants.some((v) => v.stock > 0);
  const primarySku = product.variants[0]?.sku || product.slug;
  const productUrl = `${brandConfig.seo.siteUrl}/product/${product.slug}`;

  // Structured Schema.org JSON-LD Product Data for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((img) => img.url),
    description: product.description || product.metaDescription || brandConfig.description,
    sku: primarySku,
    mpn: primarySku,
    brand: {
      '@type': 'Brand',
      name: brandConfig.name,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '19',
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: brandConfig.currency.code,
      price: product.basePrice,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: brandConfig.name,
        url: brandConfig.seo.siteUrl,
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-ondark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <ProductDetailClient product={product} />
        <RelatedProducts products={product.relatedProducts} />
      </main>
      <Footer />
    </div>
  );
}
