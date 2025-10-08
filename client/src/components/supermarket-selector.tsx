import { useQuery, useMutation } from "@tanstack/react-query";
import { Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Supermarket } from "@shared/schema";

export default function SupermarketSelector() {
  const { toast } = useToast();

  const { data: supermarkets = [] } = useQuery<Supermarket[]>({
    queryKey: ["/api/supermarkets"],
  });

  const selectSupermarketMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/supermarkets/${id}/select`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supermarkets"] });
      toast({
        title: "Supermarkt ausgewählt",
        description: "Der Supermarkt wurde erfolgreich ausgewählt",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Supermarkt konnte nicht ausgewählt werden",
        variant: "destructive",
      });
    },
  });

  const handleSelectSupermarket = (id: string) => {
    selectSupermarketMutation.mutate(id);
  };

  return (
    <Card className="mb-8" data-testid="supermarket-selector">
      <CardHeader>
        <CardTitle>Supermarkt auswählen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {supermarkets.map((market) => (
            <Button
              key={market.id}
              variant={market.isSelected ? "default" : "outline"}
              className={`p-4 h-auto justify-start ${
                market.isSelected 
                  ? "border-2 border-primary bg-accent" 
                  : "border border-border hover:border-primary"
              }`}
              onClick={() => handleSelectSupermarket(market.id)}
              disabled={selectSupermarketMutation.isPending}
              data-testid={`button-supermarket-${market.id}`}
            >
              <div className="flex items-center space-x-3">
                <Store className={`text-xl ${market.isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-left">
                  <h4 className="font-semibold text-foreground" data-testid={`text-supermarket-name-${market.id}`}>
                    {market.name}
                  </h4>
                  <p className="text-sm text-muted-foreground" data-testid={`text-supermarket-distance-${market.id}`}>
                    {market.distance} km entfernt
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
