import { useQuery, useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { HealthCriteria } from "@shared/schema";

export default function FilterControls() {
  const { data: criteria = [] } = useQuery<HealthCriteria[]>({
    queryKey: ["/api/health-criteria"],
  });

  const updateCriteriaMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<HealthCriteria> }) => {
      const response = await apiRequest("PATCH", `/api/health-criteria/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-criteria"] });
    },
  });

  const handleToggleCriteria = (id: string, isEnabled: boolean) => {
    updateCriteriaMutation.mutate({ id, updates: { isEnabled } });
  };

  return (
    <Card className="mb-8" data-testid="filter-controls">
      <CardHeader>
        <CardTitle>Ernährungskriterien</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {criteria.map((criterion) => (
            <label 
              key={criterion.id}
              className="flex items-center space-x-2 cursor-pointer"
              data-testid={`label-criteria-${criterion.id}`}
            >
              <Checkbox
                checked={criterion.isEnabled}
                onCheckedChange={(checked) => 
                  handleToggleCriteria(criterion.id, checked as boolean)
                }
                data-testid={`checkbox-criteria-${criterion.id}`}
              />
              <span className="text-sm text-foreground" data-testid={`text-criteria-name-${criterion.id}`}>
                {criterion.name}
              </span>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
