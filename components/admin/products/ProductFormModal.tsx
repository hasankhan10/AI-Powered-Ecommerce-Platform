'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/store/useToast';
import { parseProductMetadata, formatProductDescription } from '@/lib/utils/productMetadata';
import { ProductBasicDetailsSection, Category } from './modal/ProductBasicDetailsSection';
import { ProductMediaSection, ProductImageForm } from './modal/ProductMediaSection';
import { ProductVariantsSection, ProductVariantForm } from './modal/ProductVariantsSection';
import { ProductAiSeoSection } from './modal/ProductAiSeoSection';
import { ProductSocialProofSection } from './modal/ProductSocialProofSection';

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

  // Lock body scrolling when modal is open
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
      if (!res.ok) throw new Error(data.error || 'Failed to create category');

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
      toast.success(`Category "${createdCat.name}" created`, 'Category Created');
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
        toast.success('AI SEO Title & Description generated', 'SEO Optimized');
      }
    } catch (e) {
      console.warn('Could not auto-generate SEO:', e);
      toast.error('Failed to auto-generate SEO metadata');
    } finally {
      setGeneratingSeo(false);
    }
  };

  if (!isOpen) return null;

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
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setImages([...images, { url: data.url, altText: `${name} Image` }]);
      toast.success('Product image uploaded successfully', 'Media Upload');
    } catch (err: any) {
      setErrorMsg(err.message || 'Image upload failed.');
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

  const parsedMarketPrice = typeof marketPrice === 'number' ? marketPrice : parseFloat(marketPrice) || 0;
  const discountPercent =
    parsedMarketPrice > basePrice && parsedMarketPrice > 0
      ? Math.round(((parsedMarketPrice - basePrice) / parsedMarketPrice) * 100)
      : null;

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
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      toast.success(
        isEdit ? `"${name}" updated successfully` : `"${name}" published to catalogue`,
        isEdit ? 'Product Updated' : 'Product Created'
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
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col border border-hairline bg-bg-primary text-text-ondark shadow-2xl rounded-sm overflow-hidden"
      >
        {/* Sticky Header */}
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

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 space-y-8 overscroll-contain">
          {errorMsg && (
            <div className="border border-red-500/40 bg-red-950/20 p-3 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Basic Details */}
            <ProductBasicDetailsSection
              name={name}
              slug={slug}
              categoryId={categoryId}
              basePrice={basePrice}
              marketPrice={marketPrice}
              discountPercent={discountPercent}
              status={status}
              description={description}
              categoriesList={categoriesList}
              showNewCategoryModal={showNewCategoryModal}
              newCategoryName={newCategoryName}
              creatingCategory={creatingCategory}
              categoryError={categoryError}
              onNameChange={handleNameChange}
              onSlugChange={setSlug}
              onCategoryChange={setCategoryId}
              onBasePriceChange={setBasePrice}
              onMarketPriceChange={setMarketPrice}
              onStatusChange={setStatus}
              onDescriptionChange={setDescription}
              onToggleNewCategoryModal={() => setShowNewCategoryModal(!showNewCategoryModal)}
              onNewCategoryNameChange={setNewCategoryName}
              onCreateCategory={handleCreateCategory}
            />

            {/* 2. Media & Storage */}
            <ProductMediaSection
              images={images}
              imageUrlInput={imageUrlInput}
              uploadingImage={uploadingImage}
              onFileUpload={handleFileUpload}
              onImageUrlInputChange={setImageUrlInput}
              onAddImageUrl={handleAddImageUrl}
              onRemoveImage={handleRemoveImage}
            />

            {/* 3. Variant Matrix */}
            <ProductVariantsSection
              variants={variants}
              basePrice={basePrice}
              onAddVariant={handleAddVariant}
              onUpdateVariant={handleUpdateVariant}
              onRemoveVariant={handleRemoveVariant}
            />

            {/* 4. AI SEO */}
            <ProductAiSeoSection
              name={name}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              generatingSeo={generatingSeo}
              onMetaTitleChange={setMetaTitle}
              onMetaDescriptionChange={setMetaDescription}
              onAutoGenerateSeo={handleAutoGenerateSeo}
            />

            {/* 5. Social Proof Simulator */}
            <ProductSocialProofSection
              enableSocialProof={enableSocialProof}
              onToggleSocialProof={() => setEnableSocialProof(!enableSocialProof)}
            />
          </form>
        </div>

        {/* Sticky Footer */}
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
