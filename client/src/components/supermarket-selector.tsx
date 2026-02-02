import { Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSupermarket } from "@/contexts/supermarket";

export default function SupermarketSelector() {
  const { toast } = useToast();
  const { supermarkets, selectedSupermarket, selectSupermarket, isLoading } = useSupermarket();

  const handleSelectSupermarket = (id: string) => {
    selectSupermarket(id);
    toast({
      title: "Supermarkt ausgewählt",
      description: "Der Supermarkt wurde erfolgreich ausgewählt",
    });
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
              disabled={isLoading}
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
