import { useTeamsAndGoalies, Goalie } from '@/hooks/useTeamsAndGoalies';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GoalieSelectorProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  teamFilter?: 'home' | 'away';
}

export default function GoalieSelector({ label, value, onChange, teamFilter }: GoalieSelectorProps) {
  const { goalies, loading } = useTeamsAndGoalies();

  if (loading || goalies.length === 0) {
    return null;
  }

  return (
    <Select value={value || 'none'} onValueChange={(v) => onChange(v === 'none' ? null : v)}>
      <SelectTrigger className="w-full bg-secondary/50 h-8 text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Ingen målvakt vald</SelectItem>
        {goalies.map((goalie) => (
          <SelectItem key={goalie.id} value={goalie.id}>
            {goalie.name}
            {goalie.team_name && ` (${goalie.team_name})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
