import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import HealthScoreBadge from "@/components/ui/health-score-badge";
import type { Product } from "@shared/schema";

interface ProductDetailModalProps {
  productId: string | null;
  onClose: () => void;
}

export default function ProductDetailModal({ productId, onClose }: ProductDetailModalProps) {
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  if (!productId) return null;

  return (
    <Dialog open={!!productId} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="product-detail-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Produktdetails</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-6 w-6" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="p-6 text-center">Lädt Produktdetails...</div>
        ) : product ? (
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-lg"
                    data-testid="img-product-detail"
                  />
                )}
              </div>
              
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-product-detail-name">
                    {product.name}
                  </h3>
                  {product.brand && (
                    <p className="text-muted-foreground" data-testid="text-product-detail-brand">
                      Marke: {product.brand}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <HealthScoreBadge score={product.healthScore} />
                    <span className="text-lg font-bold text-foreground" data-testid="text-product-detail-price">
                      €{product.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-foreground mb-4">Nährwertanalyse</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-foreground">Zucker pro Portion</span>
                    <span className={`font-semibold ${
                      (product.sugarPerServing || 0) <= 4 ? 'text-green-600' : 'text-red-600'
                    }`} data-testid="text-sugar-content">
                      {product.sugarPerServing || 0}g {(product.sugarPerServing || 0) <= 4 ? '✓' : '✗'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-foreground">Bio-zertifiziert</span>
                    <span className={`font-semibold ${
                      product.isOrganic ? 'text-green-600' : 'text-red-600'
                    }`} data-testid="text-organic-status">
                      {product.isOrganic ? 'Ja ✓' : 'Nein ✗'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-foreground">Glutenfrei</span>
                    <span className={`font-semibold ${
                      product.isGlutenFree ? 'text-green-600' : 'text-red-600'
                    }`} data-testid="text-gluten-free-status">
                      {product.isGlutenFree ? 'Ja ✓' : 'Nein ✗'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-foreground">Nicht ultraverarbeitet</span>
                    <span className={`font-semibold ${
                      product.isNotUltraProcessed ? 'text-green-600' : 'text-red-600'
                    }`} data-testid="text-ultra-processed-status">
                      {product.isNotUltraProcessed ? 'Ja ✓' : 'Nein ✗'}
                    </span>
                  </div>
                  
                  {product.fiberRatio && (
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-foreground">Ballaststoff-Verhältnis</span>
                      <span className={`font-semibold ${
                        product.fiberRatio > 0.1 ? 'text-green-600' : 'text-red-600'
                      }`} data-testid="text-fiber-ratio">
                        1:{Math.round(1/product.fiberRatio)} {product.fiberRatio > 0.1 ? '✓' : '✗'}
                      </span>
                    </div>
                  )}
                </div>

                {product.aiEvaluation && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-foreground mb-2">KI-Bewertung</h4>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-muted-foreground" data-testid="text-detailed-ai-evaluation">
                        {product.aiEvaluation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Produkt nicht gefunden
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
