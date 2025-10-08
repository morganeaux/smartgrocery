import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HealthCriteria } from "@shared/schema";
import { useHealthCriteria } from '@/contexts/healthCriteria';

export default function FilterControls() {
  const { criteria, toggle } = useHealthCriteria();

  const handleToggleCriteria = (id: string, isEnabled: boolean) => {
    toggle(id, isEnabled);
  };

  return (
    <Card className="mb-8" data-testid="filter-controls">
      <CardHeader>
        <CardTitle>Ernährungskriterien</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {criteria.map((criterion: HealthCriteria) => (
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
