'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Eye,
  Bell,
  FolderPlus,
} from 'lucide-react';
import { toast } from '@/lib/store/useToast';
import { parseProductMetadata, formatProductDescription } from '@/lib/utils/productMetadata';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductVariantForm {
  id?: string;
  sku?: string;
  size: string;
  color: string;
  price: number;
  stock: number;
}

interface ProductImageForm {
  url: string;
  altText?: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: Category[];
  initialProduct?: any | null;
  onCategoryCreated?: (newCategory: Category) => void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSaved,
  categories,
  initialProduct,
  onCategoryCreated,
}: ProductFormModalProps) {
  const isEdit = !!initialProduct;

  // Categories list state
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories);

  useEffect(() => {
    setCategoriesList(categories);
  }, [categories]);

  // Inline Category Creation State
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [marketPrice, setMarketPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [images, setImages] = useState<ProductImageForm[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [variants, setVariants] = useState<ProductVariantForm[]>([
    { size: 'OS', color: 'Natural', price: 0, stock: 10 },
  ]);

  const [enableSocialProof, setEnableSocialProof] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [generatingSeo, setGeneratingSeo] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lock body and admin <main> scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const mainEl = document.querySelector('main');
    const originalMainOverflow = mainEl ? mainEl.style.overflow : '';

    document.body.style.overflow = 'hidden';
    if (mainEl) {
      mainEl.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      if (mainEl) {
        mainEl.style.overflow = originalMainOverflow;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setSlug(initialProduct.slug || '');
      setCategoryId(initialProduct.category?.id || initialProduct.categoryId || categoriesList[0]?.id || '');
      setBasePrice(initialProduct.basePrice || 0);

      // Parse metadata from description
      const meta = parseProductMetadata(initialProduct.description);
      setMarketPrice(initialProduct.marketPrice ?? meta.marketPrice ?? '');
      setDescription(meta.cleanDescription);
      setEnableSocialProof(meta.isSocialProofEnabled);

      setMetaTitle(initialProduct.metaTitle || '');
      setMetaDescription(initialProduct.metaDescription || '');
      setStatus(initialProduct.status || 'ACTIVE');
      setImages(initialProduct.images?.map((img: any) => ({ url: img.url, altText: img.altText })) || []);
      setVariants(
        initialProduct.variants?.map((v: any) => ({
          id: v.id,
          sku: v.sku,
          size: v.size || '',
          color: v.color || '',
          price: v.price || initialProduct.basePrice,
          stock: v.stock ?? 0,
        })) || [{ size: 'OS', color: 'Natural', price: initialProduct.basePrice || 0, stock: 10 }]
      );
    } else {
      setName('');
      setSlug('');
      setCategoryId(categoriesList[0]?.id || '');
      setBasePrice(0);
      setMarketPrice('');
      setDescription('');
      setEnableSocialProof(true);
      setMetaTitle('');
      setMetaDescription('');
      setStatus('ACTIVE');
      setImages([]);
      setVariants([{ size: 'OS', color: 'Natural', price: 0, stock: 10 }]);
    }
    setErrorMsg(null);
    setShowNewCategoryModal(false);
    setNewCategoryName('');
    setCategoryError(null);
  }, [initialProduct, categoriesList, isOpen]);

  // Handle Category Creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setCategoryError('Category name is required.');
      return;
    }

    setCreatingCategory(true);
    setCategoryError(null);

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      const createdCat: Category = {
        id: data.category.id,
        name: data.category.name,
        slug: data.category.slug,
      };

      setCategoriesList((prev) => [...prev, createdCat]);
      setCategoryId(createdCat.id);
      onCategoryCreated?.(createdCat);
      setNewCategoryName('');
      setShowNewCategoryModal(false);
      toast.success(`Category "${createdCat.name}" created`, {
        title: 'Category Created',
      });
    } catch (err: any) {
      setCategoryError(err.message || 'Error creating category');
      toast.error(err.message || 'Error creating category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleAutoGenerateSeo = async () => {
    if (!name) {
      setErrorMsg('Please enter a product name first before generating SEO.');
      toast.warning('Please enter a product name first before generating SEO.');
      return;
    }
    setGeneratingSeo(true);
    try {
      const selectedCat = categoriesList.find((c) => c.id === categoryId);
      const res = await fetch('/api/admin/seo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: initialProduct?.id,
          name,
          categoryName: selectedCat?.name,
          basePrice,
          description,
        }),
      });
      const data = await res.json();
      if (res.ok && data.seo) {
        setMetaTitle(data.seo.metaTitle);
        setMetaDescription(data.seo.metaDescription);
        if (!slug || !isEdit) {
          setSlug(data.seo.slug);
        }
        toast.success('AI SEO Title & Description generated', {
          title: 'SEO Optimized',
        });
      }
    } catch (e) {
      console.warn('Could not auto-generate SEO:', e);
      toast.error('Failed to auto-generate SEO metadata');
    } finally {
      setGeneratingSeo(false);
    }
  };

  if (!isOpen) return null;

  // Auto-generate slug when typing name in Create mode
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  // Upload image to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setImages([...images, { url: data.url, altText: `${name} Image` }]);
      toast.success('Product image uploaded successfully', {
        title: 'Media Upload',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Image upload failed. You can also paste an image URL directly.');
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput) return;
    setImages([...images, { url: imageUrlInput, altText: `${name} Image` }]);
    setImageUrlInput('');
    toast.info('Image URL added to gallery');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    toast.info('Image removed');
  };

  // Variant management
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { size: 'M', color: 'Natural', price: basePrice || 0, stock: 10 },
    ]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariantForm, val: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: val };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Calculate discount percentage preview
  const parsedMarketPrice = typeof marketPrice === 'number' ? marketPrice : parseFloat(marketPrice) || 0;
  const discountPercent =
    parsedMarketPrice > basePrice && parsedMarketPrice > 0
      ? Math.round(((parsedMarketPrice - basePrice) / parsedMarketPrice) * 100)
      : null;

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || basePrice <= 0) {
      setErrorMsg('Please provide product name, valid category, and base price.');
      toast.warning('Please provide product name, valid category, and base price.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const finalDescription = formatProductDescription({
        cleanDescription: description,
        enableSocialProof,
        marketPrice: parsedMarketPrice > 0 ? parsedMarketPrice : null,
      });

      const payload = {
        name,
        slug,
        categoryId,
        basePrice,
        marketPrice: parsedMarketPrice > 0 ? parsedMarketPrice : null,
        description: finalDescription,
        status,
        metaTitle,
        metaDescription,
        images: images.length > 0 ? images : [
          { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80', altText: name }
        ],
        variants: variants.map((v) => ({
          ...v,
          price: v.price || basePrice,
          stock: Number(v.stock),
        })),
      };

      const url = isEdit
        ? `/api/admin/products/${initialProduct.id}`
        : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      toast.success(
        isEdit
          ? `"${name}" updated successfully`
          : `"${name}" published to catalogue`,
        {
          title: isEdit ? 'Product Updated' : 'Product Created',
        }
      );

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving product');
      toast.error(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md"
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Click outside backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Main Modal Box Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col border border-hairline bg-bg-primary text-text-ondark shadow-2xl rounded-sm overflow-hidden"
      >
        {/* Sticky Top Header */}
        <div className="flex items-center justify-between border-b border-hairline px-4 py-4 sm:px-6 shrink-0 bg-bg-primary z-10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
              Catalogue Management
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-light text-text-ondark">
              {isEdit ? `Edit: ${initialProduct.name}` : 'Create New Product'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-ondark/60 hover:text-accent-brass transition-colors p-1.5 rounded-sm hover:bg-bg-deep"
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 space-y-8 overscroll-contain">
          {errorMsg && (
            <div className="border border-red-500/40 bg-red-950/20 p-3 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium border-b border-hairline/60 pb-2">
                1. Basic Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Linen Cocoon Shirt"
                    className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="linen-cocoon-shirt"
                    className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-xs font-mono text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
                  />
                </div>
              </div>

              {/* Category selection & Inline Category Creator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryModal(!showNewCategoryModal)}
                    className="inline-flex items-center gap-1 text-[11px] text-accent-brass hover:text-accent-brass-hover transition-colors font-medium"
                  >
                    <Plus size={12} />
                    <span>{showNewCategoryModal ? 'Close Category Form' : '+ Create New Category'}</span>
                  </button>
                </div>

                {/* Inline Create Category Box */}
                {showNewCategoryModal && (
                  <div className="p-3.5 border border-accent-brass/40 bg-accent-brass/5 rounded-sm space-y-2.5 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-accent-brass flex items-center gap-1.5 uppercase tracking-wider">
                        <FolderPlus size={13} /> Add New Category
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryModal(false)}
                        className="text-text-ondark/40 hover:text-text-ondark text-xs"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {categoryError && (
                      <p className="text-[11px] text-red-400 bg-red-950/40 p-1.5 border border-red-500/30">
                        {categoryError}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Footwear, Outerwear, Jewellery"
                        className="flex-1 border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={creatingCategory || !newCategoryName.trim()}
                        className="bg-accent-brass text-bg-primary hover:bg-accent-brass-hover px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors disabled:opacity-40 shrink-0"
                      >
                        {creatingCategory ? 'Saving...' : 'Save & Select'}
                      </button>
                    </div>
                  </div>
                )}

                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-xs text-text-ondark focus:border-accent-brass focus:outline-none cursor-pointer"
                >
                  {categoriesList.length === 0 ? (
                    <option value="">No categories found — create one first</option>
                  ) : (
                    categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.slug})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Pricing and Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={basePrice || ''}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    placeholder="4800"
                    className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                      Market Price (₹)
                    </label>
                    {discountPercent && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={marketPrice}
                    onChange={(e) => setMarketPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 6500 (Strike-through MRP)"
                    className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-text-ondark/40 font-light">
                    {discountPercent
                      ? `Storefront shows: ~~₹${parsedMarketPrice}~~ ₹${basePrice} (${discountPercent}% discount badge)`
                      : 'Optional MRP. If set higher than Base Price, shows cut price with % discount.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-xs text-text-ondark focus:border-accent-brass focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE (Storefront Visible)</option>
                    <option value="DRAFT">DRAFT (Hidden)</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                  Editorial Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A considered piece cut from handwoven Pondicherry linen..."
                  className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
                />
              </div>
            </div>

            {/* Section 2: Imagery & Supabase Storage */}
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
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>

                <div className="flex-1 flex w-full gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Or paste image URL (https://...)"
                    className="flex-1 border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
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
                    <div key={idx} className="group relative aspect-[3/4] border border-hairline bg-bg-deep overflow-hidden">
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
                          onClick={() => handleRemoveImage(idx)}
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

            {/* Section 3: Variant Matrix & Stock */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
                <h3 className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium">
                  3. Variant Matrix & Stock Levels
                </h3>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="inline-flex items-center gap-1 text-[11px] text-accent-brass hover:underline"
                >
                  <Plus size={12} /> Add Variant
                </button>
              </div>

              <div className="border border-hairline overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-hairline bg-bg-deep text-[10px] uppercase tracking-wider text-text-ondark/50">
                      <th className="p-3 font-medium">Size</th>
                      <th className="p-3 font-medium">Colour</th>
                      <th className="p-3 font-medium">SKU (Optional)</th>
                      <th className="p-3 font-medium">Price (₹)</th>
                      <th className="p-3 font-medium">Stock Quantity</th>
                      <th className="p-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {variants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-bg-primary/20">
                        <td className="p-2">
                          <input
                            type="text"
                            value={v.size}
                            onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)}
                            placeholder="M"
                            className="w-20 border border-hairline bg-bg-primary px-2 py-1 text-xs text-text-ondark"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={v.color}
                            onChange={(e) => handleUpdateVariant(idx, 'color', e.target.value)}
                            placeholder="Natural"
                            className="w-24 border border-hairline bg-bg-primary px-2 py-1 text-xs text-text-ondark"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={v.sku || ''}
                            onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                            placeholder="MV-AUTO"
                            className="w-32 border border-hairline bg-bg-primary px-2 py-1 text-xs font-mono text-text-ondark/80"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={v.price || basePrice}
                            onChange={(e) => handleUpdateVariant(idx, 'price', Number(e.target.value))}
                            className="w-24 border border-hairline bg-bg-primary px-2 py-1 text-xs text-text-ondark font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) => handleUpdateVariant(idx, 'stock', Number(e.target.value))}
                            className={`w-20 border px-2 py-1 text-xs font-mono ${
                              v.stock === 0
                                ? 'border-red-500/50 bg-red-950/20 text-red-300'
                                : 'border-hairline bg-bg-primary text-text-ondark'
                            }`}
                          />
                        </td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            disabled={variants.length <= 1}
                            className="text-text-ondark/40 hover:text-red-400 disabled:opacity-20 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-text-ondark/40 font-light">
                Setting variant stock to 0 immediately disables that combination on the customer product detail page.
              </p>
            </div>

            {/* Section 4: AI SEO & Search Discoverability */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
                <h3 className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium flex items-center gap-1.5">
                  <Sparkles size={13} /> 4. AI SEO & Metadata Optimization
                </h3>
                <button
                  type="button"
                  onClick={handleAutoGenerateSeo}
                  disabled={generatingSeo || !name}
                  className="inline-flex items-center gap-1.5 text-[11px] text-accent-brass hover:underline disabled:opacity-40"
                >
                  {generatingSeo ? (
                    <>
                      <RefreshCw size={11} className="animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={11} /> Auto-Generate SEO
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-text-ondark/70">
                    <label>Meta Title (Target 50–60 chars)</label>
                    <span className={metaTitle.length >= 50 && metaTitle.length <= 60 ? 'text-emerald-400' : 'text-text-ondark/40'}>
                      {metaTitle.length}/60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Linen Cocoon Shirt — Handcrafted Luxury | Maison Vale"
                    className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-text-ondark/70">
                    <label>Meta Description (Target 150–160 chars)</label>
                    <span className={metaDescription.length >= 150 && metaDescription.length <= 160 ? 'text-emerald-400' : 'text-text-ondark/40'}>
                      {metaDescription.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Discover the Linen Cocoon Shirt at Maison Vale. Handcrafted from artisanal natural materials..."
                    className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Live Social Proof & Urgency Simulation */}
            <div className="space-y-4 border-t border-hairline/60 pt-6">
              <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
                <h3 className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium flex items-center gap-1.5">
                  <Eye size={13} /> 5. Live Social Proof & Urgency Simulation
                </h3>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                    enableSocialProof
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-950/40 text-red-400 border border-red-500/30'
                  }`}
                >
                  {enableSocialProof ? 'Simulation Active' : 'Simulation Disabled'}
                </span>
              </div>

              <div className="p-4 border border-hairline bg-bg-deep rounded-md space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="toggle-simulation"
                      className="text-xs font-medium text-text-ondark cursor-pointer"
                    >
                      Enable Live Viewers & Recent Purchase Popups
                    </label>
                    <p className="text-[11px] text-text-ondark/60 font-light leading-relaxed">
                      Displays dynamic live viewer counts (e.g. &ldquo;13 patrons viewing this piece&rdquo;) and periodic verified order toasts (every 10–12s from luxury Indian cities) on this product&apos;s details page to enhance patron interest and conversion.
                    </p>
                  </div>

                  <button
                    id="toggle-simulation"
                    type="button"
                    onClick={() => setEnableSocialProof(!enableSocialProof)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      enableSocialProof ? 'bg-accent-brass' : 'bg-bg-primary border-hairline'
                    }`}
                    role="switch"
                    aria-checked={enableSocialProof}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bg-deep shadow ring-0 transition duration-200 ease-in-out ${
                        enableSocialProof ? 'translate-x-5 bg-bg-primary' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Simulation Feature Preview */}
                {enableSocialProof && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-hairline/40 text-xs">
                    <div className="flex items-center gap-2.5 p-2.5 bg-bg-primary border border-hairline rounded">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-text-ondark/80 text-[11px]">
                        <strong>13 patrons</strong> viewing this piece right now
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 bg-bg-primary border border-hairline rounded">
                      <Bell size={13} className="text-accent-brass shrink-0" />
                      <span className="text-text-ondark/80 text-[11px] truncate">
                        <strong>Ananya D.</strong> in Mumbai recently purchased
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Sticky Bottom Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-4 py-4 sm:px-6 border-t border-hairline bg-bg-primary shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="border border-hairline px-6 py-2.5 text-xs uppercase tracking-wider text-text-ondark/70 hover:border-text-ondark transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={submitting}
            className="bg-accent-brass px-8 py-2.5 text-xs uppercase tracking-[0.2em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md"
          >
            <Check size={14} />
            <span>{submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Publish Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
