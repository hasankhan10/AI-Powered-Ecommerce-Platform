'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Search, Edit2, Trash2, ExternalLink, Package } from 'lucide-react';
import { toast } from '@/lib/store/useToast';
import { ProductFormModal } from './ProductFormModal';

interface ProductListTableProps {
  initialProducts: any[];
  categories: any[];
}

export function ProductListTable({
  initialProducts,
  categories,
}: ProductListTableProps) {
  const [products, setProducts] = useState(initialProducts);
  const [categoryList, setCategoryList] = useState(categories);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        if (data.categories) {
          setCategoryList(data.categories);
        }
      }
    } catch (err) {
      console.error('Error refreshing products:', err);
    }
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to delete product');
      }

      setProducts(products.filter((p) => p.id !== id));
      toast.success(`"${name}" was deleted from catalogue`, {
        title: 'Product Removed',
      });
    } catch (err: any) {
      toast.error(err.message || 'Error deleting product');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-3 text-text-ondark/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title or category..."
            className="w-full border border-hairline bg-bg-deep py-2.5 pl-10 pr-4 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors"
          />
        </div>

        {/* Add Product Button */}
        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 bg-accent-brass px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors shrink-0"
        >
          <Plus size={14} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="border border-hairline bg-bg-deep overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Package size={36} className="text-accent-brass/40 mx-auto stroke-1" />
            <p className="text-xs text-text-ondark/60 font-light">
              {searchTerm ? 'No products match your search.' : 'No products in catalogue.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-hairline text-[10px] uppercase tracking-wider text-text-ondark/50 bg-bg-primary/40">
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Variants & Stock</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Base Price</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map((prod) => {
                  const totalStock = prod.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
                  const isOutOfStock = totalStock === 0;

                  return (
                    <tr key={prod.id} className="hover:bg-bg-primary/30 transition-colors">
                      {/* Product details */}
                      <td className="p-4 flex items-center gap-3.5">
                        <div className="relative h-14 w-11 shrink-0 border border-hairline bg-bg-primary overflow-hidden">
                          <Image
                            src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80'}
                            alt={prod.name}
                            fill
                            sizes="45px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-serif text-sm font-light text-text-ondark line-clamp-1">
                              {prod.name}
                            </p>
                            <a
                              href={`/product/${prod.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-text-ondark/40 hover:text-accent-brass transition-colors"
                              title="View on live storefront"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                          <span className="text-[10px] text-text-ondark/40 font-mono">
                            /{prod.slug}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-text-ondark/80">
                        {prod.category?.name || 'Collection'}
                      </td>

                      {/* Variants & Stock */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="text-text-ondark/80 font-mono text-[11px]">
                            {prod.variants?.length || 0} variant{prod.variants?.length === 1 ? '' : 's'}
                          </span>
                          <div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 text-[10px] border ${
                                isOutOfStock
                                  ? 'border-red-500/40 text-red-400 bg-red-950/20'
                                  : totalStock <= 5
                                  ? 'border-amber-500/40 text-amber-400 bg-amber-950/20'
                                  : 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
                              }`}
                            >
                              {isOutOfStock ? '0 in stock (Sold Out)' : `${totalStock} units available`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status & Simulation */}
                      <td className="p-4 space-y-1">
                        <div>
                          <span
                            className={`inline-flex items-center border px-2 py-0.5 text-[10px] ${
                              prod.status === 'ACTIVE'
                                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20'
                                : 'border-hairline text-text-ondark/50'
                            }`}
                          >
                            {prod.status}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-mono ${
                              prod.description?.includes('<!-- social_proof: disabled -->')
                                ? 'text-text-ondark/40'
                                : 'text-accent-brass'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                prod.description?.includes('<!-- social_proof: disabled -->')
                                  ? 'bg-text-ondark/30'
                                  : 'bg-emerald-400'
                              }`}
                            />
                            {prod.description?.includes('<!-- social_proof: disabled -->')
                              ? 'Simulation Off'
                              : 'Simulation On'}
                          </span>
                        </div>
                      </td>

                      {/* Base Price */}
                      <td className="p-4 text-right">
                        <div className="font-serif text-sm text-text-ondark">
                          ₹{prod.basePrice?.toLocaleString('en-IN')}
                        </div>
                        {prod.marketPrice && prod.marketPrice > prod.basePrice && (
                          <div className="text-[10px] space-x-1">
                            <span className="line-through text-text-ondark/40 font-light font-mono">
                              ₹{prod.marketPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-emerald-400 font-medium">
                              {Math.round(((prod.marketPrice - prod.basePrice) / prod.marketPrice) * 100)}% OFF
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(prod)}
                            className="p-1.5 border border-hairline hover:border-accent-brass hover:text-accent-brass transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            disabled={deletingId === prod.id}
                            className="p-1.5 border border-hairline hover:border-red-500 hover:text-red-400 transition-colors disabled:opacity-30"
                            title="Delete Product"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchProducts}
        categories={categoryList}
        initialProduct={selectedProduct}
        onCategoryCreated={(newCat) => setCategoryList((prev) => [...prev, newCat])}
      />
    </div>
  );
}
