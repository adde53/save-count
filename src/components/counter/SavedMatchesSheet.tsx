import { Trash2, Play } from 'lucide-react';
import { SavedMatch, getTotals } from '@/lib/matchTypes';
import { getSportConfig } from '@/lib/sportConfig';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SavedMatchesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedMatches: SavedMatch[];
  onLoadMatch: (match: SavedMatch) => void;
  onDeleteMatch: (id: string) => void;
}

export default function SavedMatchesSheet({
  open,
  onOpenChange,
  savedMatches,
  onLoadMatch,
  onDeleteMatch,
}: SavedMatchesSheetProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Sparade matcher</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(70vh-100px)]">
          {savedMatches.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Inga sparade matcher ännu
            </p>
          ) : (
            savedMatches.map((match) => {
              const totals = getTotals(match.periods);
              const sportConfig = getSportConfig(match.sport);
              
              return (
                <div
                  key={match.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                        {sportConfig.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(match.savedAt)}
                      </span>
                    </div>
                    <div className="font-semibold">
                      {match.homeTeamName} vs {match.awayTeamName}
                    </div>
                    <div className="text-sm">
                      <span className="text-home font-bold">{totals.home}</span>
                      {' - '}
                      <span className="text-away font-bold">{totals.away}</span>
                      {' räddningar'}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onLoadMatch(match)}
                    className="p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 tap-scale"
                    aria-label="Ladda match"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => onDeleteMatch(match.id)}
                    className="p-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 tap-scale"
                    aria-label="Ta bort match"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
