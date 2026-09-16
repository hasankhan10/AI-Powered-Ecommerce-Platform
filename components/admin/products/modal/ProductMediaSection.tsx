'use client';

import React from 'react';
import Image from 'next/image';
import { Upload, Trash2 } from 'lucide-react';

export interface ProductImageForm {
  url: string;
  altText?: string;
}

interface ProductMediaSectionProps {
  images: ProductImageForm[];
  imageUrlInput: string;
  uploadingImage: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUrlInputChange: (val: string) => void;
  onAddImageUrl: () => void;
  onRemoveImage: (index: number) => void;
}

export function ProductMediaSection({
  images,
  imageUrlInput,
  uploadingImage,
  onFileUpload,
  onImageUrlInputChange,
  onAddImageUrl,
  onRemoveImage,
}: ProductMediaSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium border-b border-hairline/60 pb-2">
        2. Imagery (Supabase Storage / CDN)
      </h3>

      {/* Upload or URL Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-hairline bg-bg-deep px-4 py-2.5 text-xs text-text-ondark hover:border-accent-brass transition-colors cursor-pointer shrink-0">
          <Upload size={14} className="text-accent-brass" />
          <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={onFileUpload}
            disabled={uploadingImage}
            className="hidden"
          />
        </label>

        <div className="flex-1 flex w-full gap-2">
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => onImageUrlInputChange(e.target.value)}
            placeholder="Or paste image URL (https://...)"
            className="flex-1 border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
          />
          <button
            type="button"
            onClick={onAddImageUrl}
            className="border border-hairline bg-bg-deep px-4 py-2 text-xs uppercase tracking-wider text-text-ondark hover:border-accent-brass transition-colors"
          >
            Add URL
          </button>
        </div>
      </div>

      {/* Thumbnail Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="group relative aspect-[3/4] border border-hairline bg-bg-deep overflow-hidden"
            >
              <Image
                src={img.url}
                alt={img.altText || 'Product image'}
                fill
                sizes="120px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-bg-deep/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onRemoveImage(idx)}
                  className="bg-red-950/80 text-red-300 p-1.5 rounded hover:bg-red-900 transition-colors"
                  title="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-accent-brass text-bg-primary text-[8px] uppercase tracking-widest px-1 py-0.5 font-bold">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-text-ondark/40 italic">
          No images added yet. A placeholder will be assigned if left empty.
        </p>
      )}
    </div>
  );
}
