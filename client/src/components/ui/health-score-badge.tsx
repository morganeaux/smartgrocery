import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HealthScoreBadgeProps {
  score: number;
  className?: string;
}

export default function HealthScoreBadge({ score, className }: HealthScoreBadgeProps) {
  const getScoreConfig = (score: number) => {
    if (score >= 4) {
      return {
        label: "Exzellent",
        className: "health-score-excellent",
      };
    } else if (score >= 3) {
      return {
        label: "Gut",
        className: "health-score-good",
      };
    } else {
      return {
        label: "Schlecht",
        className: "health-score-poor",
      };
    }
  };

  const config = getScoreConfig(score);

  return (
    <Badge 
      className={cn(config.className, "font-medium border", className)}
      data-testid={`health-score-badge-${score}`}
    >
      {config.label}
    </Badge>
  );
}
