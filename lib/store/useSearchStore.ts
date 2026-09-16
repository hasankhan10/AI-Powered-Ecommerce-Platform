import { create } from 'zustand';

export interface SearchProductResult {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug?: string;
  basePrice: number;
  image: string;
  description: string;
  stock: number;
  inStock: boolean;
  score?: number;
}

export interface SearchCategoryResult {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface SearchResponse {
  query: string;
  parsedConstraints?: {
    maxPrice?: number;
    minPrice?: number;
    category?: string;
  };
  products: SearchProductResult[];
  categories: SearchCategoryResult[];
}

interface SearchStore {
  isOpen: boolean;
  query: string;
  results: SearchResponse;
  isLoading: boolean;
  openSearch: (initialQuery?: string) => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  setQuery: (query: string) => void;
  setResults: (results: SearchResponse) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const emptyResults: SearchResponse = {
  query: '',
  products: [],
  categories: [],
};

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  query: '',
  results: emptyResults,
  isLoading: false,
  openSearch: (initialQuery) =>
    set({
      isOpen: true,
      query: initialQuery || '',
    }),
  closeSearch: () =>
    set({
      isOpen: false,
      query: '',
      results: emptyResults,
      isLoading: false,
    }),
  toggleSearch: () =>
    set((state) => ({
      isOpen: !state.isOpen,
      ...(state.isOpen ? { query: '', results: emptyResults } : {}),
    })),
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
