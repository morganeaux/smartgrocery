import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HealthScoreBadge from "@/components/ui/health-score-badge";
import type { Product, ProductSearchFilters } from "@shared/schema";

interface ProductRecommendationsProps {
  onProductSelect: (productId: string) => void;
}

export default function ProductRecommendations({ onProductSelect }: ProductRecommendationsProps) {
  const [filters] = useState<ProductSearchFilters>({
    isOrganic: true,
    isNotUltraProcessed: true,
    minHealthScore: 4,
  });

  const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ["/api/products", filters],
  });

  if (isLoading) {
    return (
      <Card data-testid="product-recommendations">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Lädt Produktempfehlungen...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="product-recommendations">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Empfohlene Produkte</CardTitle>
          <span className="text-sm text-muted-foreground">Basierend auf Ihren Kriterien</span>
        </div>
      </CardHeader>
      
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8" data-testid="no-products-message">
            <p className="text-muted-foreground mb-4">
              Keine Produkte gefunden, die Ihren Kriterien entsprechen.
            </p>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              data-testid="button-refresh-products"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Aktualisieren
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="border border-border rounded-lg p-6 hover:border-primary transition-colors"
                data-testid={`product-card-${product.id}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full lg:w-32 h-32 object-cover rounded-lg"
                      data-testid={`img-product-${product.id}`}
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-foreground" data-testid={`text-product-name-${product.id}`}>
                        {product.name}
                        {product.brand && (
                          <span className="text-muted-foreground ml-2">von {product.brand}</span>
                        )}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <HealthScoreBadge score={product.healthScore} />
                        <span className="text-lg font-bold text-foreground" data-testid={`text-product-price-${product.id}`}>
                          €{product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3" data-testid={`text-product-details-${product.id}`}>
                      {product.size} • Verfügbar bei {product.supermarket}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.isOrganic && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Bio-zertifiziert
                        </Badge>
                      )}
                      {product.isGlutenFree && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Glutenfrei
                        </Badge>
                      )}
                      {product.isLactoseFree && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Laktosefrei
                        </Badge>
                      )}
                      {product.isSoyFree && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Sojafrei
                        </Badge>
                      )}
                      {product.hasNoSweeteners && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Ohne Süßstoffe
                        </Badge>
                      )}
                      {product.isNotUltraProcessed && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Nicht ultraverarbeitet
                        </Badge>
                      )}
                    </div>
                    
                    {product.aiEvaluation && (
                      <div className="bg-muted rounded-lg p-3 mb-4">
                        <h5 className="font-medium text-foreground mb-2">KI-Bewertung:</h5>
                        <p className="text-sm text-muted-foreground" data-testid={`text-ai-evaluation-${product.id}`}>
                          {product.aiEvaluation}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <Button data-testid={`button-add-to-list-${product.id}`}>
                        <Plus className="w-4 h-4 mr-2" />
                        Zur Liste hinzufügen
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => onProductSelect(product.id)}
                        data-testid={`button-product-details-${product.id}`}
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Details anzeigen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center mt-8">
              <Button 
                variant="secondary"
                onClick={() => refetch()}
                data-testid="button-load-more-products"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Mehr Produkte laden
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
