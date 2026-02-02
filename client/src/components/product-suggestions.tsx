
import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import type { Product } from "@shared/schema";
import { useHealthCriteria } from '@/contexts/healthCriteria';
import { useSupermarket } from '@/contexts/supermarket';

export interface ProductSuggestionsProps {
  query: string;
  limit?: number;
  onSelect: (product: Product) => void;
}

function SuggestionCard({ product, onSelect, onOpen }: { product: Product; onSelect: (p: Product) => void; onOpen: (p: Product) => void }) {
  return (
    <div className="flex-shrink-0 w-36 sm:w-40 md:w-44 lg:w-48">
      <div className="relative">
        <div className="border border-border rounded-lg p-2 hover:border-primary transition-colors bg-white">
          {/* Produktbild */}
          <div className="h-20 mb-2 flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name || "Produktbild"}
                loading="lazy"
                decoding="async"
                className="max-h-16 object-contain"
              />
            ) : (
              <div className="h-16 w-full bg-gray-100" />
            )}
          </div>
          
          {/* Produktname */}
          <div className="text-sm font-medium text-foreground mb-1 truncate" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </div>
          
          {/* Brand & Size */}
          <div className="text-[11px] text-muted-foreground mb-2 truncate" data-testid={`text-product-brand-${product.id}`}>
            {product.brand} • {product.size}
          </div>
          
          {/* Preis & Health Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
              {product.price && product.price > 0 ? `€${product.price.toFixed(2)}` : 'k.A.'}
            </span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-xs ${i < (product.healthScore || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
          
          {/* Supermarkt */}
          <div className="text-[11px] text-muted-foreground mt-1 truncate" data-testid={`text-product-supermarket-${product.id}`}>
            {product.supermarket}
          </div>
        </div>

        {/* Action Buttons - Immer sichtbar, klar getrennt */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {/* Details anzeigen - Lupen-Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(product);
            }}
            className="bg-white hover:bg-gray-100 text-gray-700 rounded-full p-1.5 shadow-md border border-gray-200 transition-colors"
            aria-label={`Details anzeigen für ${product.name}`}
            title="Details anzeigen"
          >
            <Search className="w-4 h-4" />
          </button>
          
          {/* Produkt hinzufügen - Plus-Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="bg-primary hover:bg-primary/90 text-white rounded-full p-1.5 shadow-md transition-colors"
            aria-label={`${product.name} zur Liste hinzufügen`}
            title="Zur Liste hinzufügen"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductSuggestions({ query, limit = 6, onSelect }: ProductSuggestionsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const { enabledNames: enabledCriteria } = useHealthCriteria();
  const { selectedSupermarket } = useSupermarket();

  useEffect(() => {
    if (!query || query.trim() === "") {
      setProducts([]);
      return;
    }

    let cancelled = false;
      const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ query, limit: String(limit) });
        if (enabledCriteria.length) params.set('criteria', enabledCriteria.join(','));
        
        // Supermarkt-Filter hinzufügen
        if (selectedSupermarket?.name) {
          params.set('supermarket', selectedSupermarket.name);
        }
        
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) setProducts(data || []);
      } catch (err) {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, limit, enabledCriteria, selectedSupermarket]);

  // Wenn kein Query, nichts anzeigen
  if (!query) return null;

  return (
    <>
      {/* Loading State */}
      {loading && (
        <div className="mt-2 text-xs text-muted-foreground" data-testid="product-suggestions-loading">
          Suche nach Produkten für "{query}"...
        </div>
      )}
      
      {/* Active filters badge - nur anzeigen wenn nicht loading und Produkte vorhanden */}
      {!loading && products.length > 0 && (enabledCriteria.length > 0 || selectedSupermarket) && (
        <div className="mt-2">
          <div className="text-xs text-muted-foreground mb-1">Aktive Filter:</div>
          <div className="flex flex-wrap gap-2">
            {selectedSupermarket && (
              <span className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded" data-testid="active-filter-supermarket">
                Supermarkt: {selectedSupermarket.name}
              </span>
            )}
            {enabledCriteria.map((c) => (
              <span key={c} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded" data-testid={`active-filter-${c}`}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Keine Produkte gefunden */}
      {!loading && products.length === 0 && (
        <div className="mt-2 text-xs text-muted-foreground" data-testid="product-suggestions-empty">
          Keine Produkte gefunden für "{query}"
        </div>
      )}
      
      {/* Produkte anzeigen */}
      {!loading && products.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide" data-testid="product-suggestions-carousel">
            {products.map((p) => (
              <SuggestionCard key={p.id} product={p} onSelect={onSelect} onOpen={(prod) => setDetailsProduct(prod)} />
            ))}
          </div>
        </div>
      )}

      {/* render details modal when a product is selected for details */}
      {detailsProduct && (
        <DetailsModal
          product={detailsProduct}
          enabledCriteria={enabledCriteria}
          onClose={() => setDetailsProduct(null)}
          onAdd={(p) => {
            onSelect(p);
            setDetailsProduct(null);
          }}
        />
      )}
    </>
  );
}

// Details Modal (simple inline implementation)
function DetailsModal({ product, enabledCriteria, onClose, onAdd }: { product: Product; enabledCriteria?: string[]; onClose: () => void; onAdd: (p: Product) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <button onClick={onClose} className="text-sm text-muted-foreground">Schließen</button>
        </div>
        <div className="mt-4">
          <div className="h-40 flex items-center justify-center mb-4">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="max-h-36 object-contain" />
            ) : (
              <div className="h-36 w-full bg-gray-100" />
            )}
          </div>

          <div className="text-sm text-muted-foreground">{product.brand} • {product.size}</div>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm font-bold text-primary">{product.price && product.price > 0 ? `€${product.price.toFixed(2)}` : 'k.A.'}</div>
            <div className="text-xs text-muted-foreground">{product.supermarket}</div>
          </div>

          {/* Nutrition / Health Criteria */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Ernährungskriterien</h4>
            <div className="flex flex-wrap gap-2">
              {/* Show all enabled criteria, highlight if product fulfills them */}
              {enabledCriteria && enabledCriteria.length > 0 ? (
                enabledCriteria.map((c) => {
                  // Map criterion name to product flag
                  let flag = false;
                  const key = c.toLowerCase();
                  if (key.includes('bio') || key.includes('organic')) flag = product.isOrganic;
                  else if (key.includes('gluten')) flag = product.isGlutenFree;
                  else if (key.includes('lakt')) flag = product.isLactoseFree;
                  else if (key.includes('soja') || key.includes('soy')) flag = product.isSoyFree;
                  else if (key.includes('süß') || key.includes('suss') || key.includes('sweetener')) flag = product.hasNoSweeteners;
                  else if (key.includes('ultra') || key.includes('ultraverarbeitet') || key.includes('ultraprocess')) flag = product.isNotUltraProcessed;
                  return flag ? (
                    <span key={c} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded" data-testid={`criteria-match-${c}`}>{c}</span>
                  ) : (
                    <span key={c} className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded line-through" data-testid={`criteria-miss-${c}`}>{c}</span>
                  );
                })
              ) : (
                // fallback: show all product flags
                <>
                  {product.isOrganic ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Bio</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-muted-foreground px-2 py-1 rounded">kein Bio</span>
                  )}
                  {product.isGlutenFree ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Glutenfrei</span>
                  ) : null}
                  {product.isLactoseFree ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Laktosefrei</span>
                  ) : null}
                  {product.isSoyFree ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Sojafrei</span>
                  ) : null}
                  {product.hasNoSweeteners ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Ohne Süßstoffe</span>
                  ) : null}
                  {product.isNotUltraProcessed ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Nicht ultra‑verarbeitet</span>
                  ) : null}
                </>
              )}
            </div>

            {/* Applied filters */}
            {enabledCriteria && enabledCriteria.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Angewandte Filter</h4>
                <div className="flex flex-wrap gap-2">
                  {enabledCriteria.map((c) => (
                    <span key={c} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded">{c}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div>Zucker / Portion</div>
              <div className="text-right">{product.sugarPerServing ? `${product.sugarPerServing} g` : 'k.A.'}</div>

              <div>Ballaststoff‑Verhältnis</div>
              <div className="text-right">{product.fiberRatio ? product.fiberRatio.toFixed(2) : 'k.A.'}</div>

              <div>Natrium/Kalorien‑Ratio</div>
              <div className="text-right">{product.sodiumCalorieRatio ? product.sodiumCalorieRatio.toFixed(2) : 'k.A.'}</div>
            </div>
          </div>

          <p className="mt-4 text-sm text-foreground">{product.aiEvaluation || ''}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={() => { onAdd(product); onClose(); }} className="bg-primary text-white px-4 py-2 rounded">Hinzufügen</button>
        </div>
      </div>
    </div>
  );
}
