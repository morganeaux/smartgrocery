import { useState } from "react";
import ProductSuggestions from "./product-suggestions";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ShoppingListItem, InsertShoppingListItem, Product } from "@shared/schema";

interface ShoppingListSidebarProps {
  onProductSelect?: (productId: string) => void;
}

export default function ShoppingListSidebar({ onProductSelect }: ShoppingListSidebarProps) {
  const [newItem, setNewItem] = useState("");
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery<ShoppingListItem[]>({
    queryKey: ["/api/shopping-list"],
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: InsertShoppingListItem) => {
      const response = await apiRequest("POST", "/api/shopping-list", item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list"] });
      setNewItem("");
      toast({
        title: "Artikel hinzugefügt",
        description: "Der Artikel wurde zur Einkaufsliste hinzugefügt",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Artikel konnte nicht hinzugefügt werden",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ShoppingListItem> }) => {
      const response = await apiRequest("PATCH", `/api/shopping-list/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/shopping-list/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list"] });
      toast({
        title: "Artikel entfernt",
        description: "Der Artikel wurde aus der Einkaufsliste entfernt",
      });
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    addItemMutation.mutate({
      name: newItem.trim(),
      quantity: "1x",
      completed: false,
    });
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateItemMutation.mutate({ id, updates: { completed } });
  };

  const handleDeleteItem = (id: string) => {
    deleteItemMutation.mutate(id);
  };

  return (
    <Card className="sticky top-24" data-testid="shopping-list-sidebar">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Meine Einkaufsliste</span>
          <Badge variant="secondary" data-testid="shopping-list-count">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleAddItem} className="flex" data-testid="add-item-form">
          <Input
            type="text"
            placeholder="Produkt hinzufügen..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-1 rounded-r-none"
            data-testid="input-new-item"
          />
          <Button 
            type="submit" 
            className="rounded-l-none"
            disabled={addItemMutation.isPending}
            data-testid="button-add-item"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </form>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Lädt...</div>
          ) : items.length === 0 ? (
            <div className="text-center text-muted-foreground" data-testid="empty-shopping-list">
              Ihre Einkaufsliste ist leer
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-3 bg-muted rounded-lg" data-testid={`shopping-item-${item.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Produktbild anzeigen, wenn vorhanden */}
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={(checked) => 
                        handleToggleComplete(item.id, checked as boolean)
                      }
                      data-testid={`checkbox-item-${item.id}`}
                    />
                    <span 
                      className={`text-foreground ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                      data-testid={`text-item-name-${item.id}`}
                    >
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground" data-testid={`text-item-quantity-${item.id}`}>
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      data-testid={`button-delete-item-${item.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Produktvorschläge erscheinen automatisch unter jedem Listeneintrag */}
                {!item.completed && (
                  <div className="mt-2">
                    <ProductSuggestions
                      query={item.name}
                      onSelect={async (product) => {
                        // Produkt auswählen: Name UND Bild werden übernommen
                        try {
                          await updateItemMutation.mutateAsync({ 
                            id: item.id, 
                            updates: { 
                              name: product.name,
                              imageUrl: product.imageUrl
                            } 
                          });
                          toast({
                            title: "Produkt übernommen",
                            description: `${product.name} wurde zur Einkaufsliste hinzugefügt`,
                          });
                        } catch (e) {
                          // ignore - mutation handles error toast
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
