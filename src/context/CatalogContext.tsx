import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { productsApi } from '../lib/firebase';
import { isListed } from '../lib/availability';
import { FABRICS } from '../constants';
import type { Fabric, MasterCategory } from '../types';

interface CatalogContextValue {
  products: Fabric[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  byId: (id: string) => Fabric | undefined;
  byCategory: (category: MasterCategory | string) => Fabric[];
  bySubCategory: (category: MasterCategory | string, subCategory: string) => Fabric[];
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Fabric[]>(() => FABRICS.filter(isListed));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const rows = (await productsApi.list({ limit: 1000 })) as unknown as Fabric[];
        if (!cancelled) {
          const listed = rows.filter(isListed);
          if (listed.length > 0) {
            setProducts(listed);
          } else {
            // Firestore is currently empty in the connected Firebase project.
            // Fall back to built-in FABRICS catalogue so the storefront is immediately fully loaded.
            setProducts(FABRICS.filter(isListed));
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Could not load catalogue from Firestore, falling back to local catalogue:', err);
          // Gracefully fallback to built-in catalogue so the storefront remains fully functional
          setProducts(FABRICS.filter(isListed));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const refresh = () => setReloadKey(k => k + 1);

  const value = useMemo<CatalogContextValue>(() => {
    const byId = (id: string) => products.find(p => p.id === id);
    const byCategory = (category: MasterCategory | string) =>
      products.filter(p => p.masterCategory === category || p.category === category);
    const bySubCategory = (category: MasterCategory | string, subCategory: string) =>
      byCategory(category).filter(p => p.subCategory === subCategory);
    return { products, loading, error, refresh, byId, byCategory, bySubCategory };
  }, [products, loading, error]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
};
