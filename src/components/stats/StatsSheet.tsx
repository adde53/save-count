import { useState } from 'react';
import { ChevronDown, ChevronUp, Trophy, Target, Calendar } from 'lucide-react';
import { useGoalieStats } from '@/hooks/useGoalieStats';
import { useAuth } from '@/hooks/useAuth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface StatsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StatsSheet({ open, onOpenChange }: StatsSheetProps) {
  const { user } = useAuth();
  const { stats, loading } = useGoalieStats();
  const [expandedGoalie, setExpandedGoalie] = useState<string | null>(null);

  if (!user) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[50vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Statistik</SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Logga in för att se statistik</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-undo" />
            Målvaktsstatistik
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(85vh-100px)]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Laddar...</div>
          ) : stats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Ingen statistik ännu</p>
              <p className="text-sm text-muted-foreground mt-1">
                Lägg till målvakter och koppla dem till matcher
              </p>
            </div>
          ) : (
            stats.map((goalie, index) => (
              <div key={goalie.id} className="rounded-xl bg-card border border-border overflow-hidden">
                {/* Goalie Header */}
                <button
                  onClick={() => setExpandedGoalie(expandedGoalie === goalie.id ? null : goalie.id)}
                  className="w-full p-4 flex items-center gap-3 tap-scale"
                >
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-undo/20 text-undo' :
                    index === 1 ? 'bg-muted-foreground/20 text-muted-foreground' :
                    index === 2 ? 'bg-away/20 text-away' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{goalie.name}</div>
                    {goalie.team_name && (
                      <div className="text-xs text-muted-foreground">{goalie.team_name}</div>
                    )}
                  </div>

                  {/* Stats Summary */}
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-lg font-bold text-home">{goalie.total_saves}</div>
                      <div className="text-xs text-muted-foreground">räddningar</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{goalie.matches_played}</div>
                      <div className="text-xs text-muted-foreground">matcher</div>
                    </div>
                    {expandedGoalie === goalie.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Match History */}
                {expandedGoalie === goalie.id && (
                  <div className="border-t border-border bg-secondary/30 p-4 space-y-3">
                    {/* Average */}
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Snitt:</span>
                      <span className="font-medium">{goalie.avg_saves_per_match} räddningar/match</span>
                    </div>

                    {/* Match History */}
                    {goalie.matches.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          Matchhistorik
                        </div>
                        {goalie.matches.slice(0, 10).map((match) => (
                          <div
                            key={match.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-card text-sm"
                          >
                            <div>
                              <span className="text-muted-foreground">{formatDate(match.date)}</span>
                              <span className="mx-2">vs</span>
                              <span>{match.opponent}</span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({match.is_home ? 'hemma' : 'borta'})
                              </span>
                            </div>
                            <div className="font-bold text-home">{match.saves}</div>
                          </div>
                        ))}
                        {goalie.matches.length > 10 && (
                          <p className="text-xs text-center text-muted-foreground">
                            +{goalie.matches.length - 10} fler matcher
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Inga matcher registrerade</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
