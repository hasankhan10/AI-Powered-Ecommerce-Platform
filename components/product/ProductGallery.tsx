'use client';

import React from 'react';
import Image from 'next/image';

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  activeImageIndex: number;
  onSelectImage: (index: number) => void;
}

export function ProductGallery({
  images,
  productName,
  activeImageIndex,
  onSelectImage,
}: ProductGalleryProps) {
  const activeImage = images[activeImageIndex] || {
    id: 'default',
    url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80',
    altText: productName,
  };

  return (
    <div className="lg:col-span-7 space-y-6">
      {/* Main Featured Image */}
      <div className="relative aspect-[4/5] w-full border border-hairline bg-bg-deep overflow-hidden rounded-lg">
        <Image
          src={activeImage.url}
          alt={activeImage.altText || productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover object-center transition-all duration-500"
        />
      </div>

      {/* Thumbnail Carousel / List */}
      {images.length > 1 && (
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onSelectImage(idx)}
              className={`relative h-24 w-20 shrink-0 border transition-all overflow-hidden rounded-md cursor-pointer ${
                activeImageIndex === idx
                  ? 'border-accent-brass ring-1 ring-accent-brass'
                  : 'border-hairline opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `View ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
