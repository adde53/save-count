import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatch } from '@/hooks/useMatch';
import { getSportConfig } from '@/lib/sportConfig';
import { getTotals } from '@/lib/matchTypes';
import { ShotOutcome } from '@/lib/shotTypes';
import SportSelector from './counter/SportSelector';
import PeriodTabs from './counter/PeriodTabs';
import TeamCounter from './counter/TeamCounter';
import MatchActions from './counter/MatchActions';
import ResetConfirmDialog from './counter/ResetConfirmDialog';
import SavedMatchesSheet from './counter/SavedMatchesSheet';
import TeamsGoaliesSheet from './manage/TeamsGoaliesSheet';
import StatsSheet from './stats/StatsSheet';
import UserMenu from './auth/UserMenu';
import AuthSheet from './auth/AuthSheet';
import { toast } from 'sonner';
import { Target, Shield } from 'lucide-react';

export default function SaveCounter() {
  const navigate = useNavigate();
  const {
    match, savedMatches, animatingTeam, isLoggedIn,
    changeSport, setTeamName, setCurrentPeriod,
    addSave, undo, reset, saveMatch, loadMatch, deleteMatch, getShareUrl,
    homeGoalieId, awayGoalieId, setHomeGoalieId, setAwayGoalieId,
  } = useMatch();

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showSavedMatches, setShowSavedMatches] = useState(false);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [showTeamsSheet, setShowTeamsSheet] = useState(false);
  const [showStatsSheet, setShowStatsSheet] = useState(false);

  const sportConfig = getSportConfig(match.sport);
  const currentPeriodCounts = match.periods[match.currentPeriod];
  const totals = getTotals(match.periods);
  const hasAnySaves = totals.home > 0 || totals.away > 0;

  const handleShare = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Räddningsräknare',
          text: `${match.homeTeamName} ${totals.home} - ${totals.away} ${match.awayTeamName}`,
          url,
        });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Länk kopierad!');
    }
  };

  const handleSave = async () => {
    try {
      await saveMatch();
      toast.success(isLoggedIn ? 'Match sparad till ditt konto!' : 'Match sparad lokalt!');
    } catch {
      toast.error('Kunde inte spara matchen');
    }
  };

  const handleLoadMatch = (savedMatch: typeof savedMatches[0]) => {
    loadMatch(savedMatch);
    setShowSavedMatches(false);
    toast.success('Match laddad!');
  };

  const handleReset = () => {
    reset();
    setShowResetDialog(false);
    toast.success('Match nollställd!');
  };

  const handleShot = (team: 'home' | 'away', outcome: ShotOutcome) => {
    if (outcome === 'save') {
      addSave(team);
    }
  };

  const goToGoalTracker = () => {
    navigate(`/goal-tracker?sport=${match.sport}&home=${encodeURIComponent(match.homeTeamName)}&away=${encodeURIComponent(match.awayTeamName)}`);
  };

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] bg-background">
      {/* ─── Top navigation bar ─── */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <h1 className="text-base font-bold tracking-tight text-foreground">
          🏒 SaveTracker
        </h1>
        <UserMenu onLoginClick={() => setShowAuthSheet(true)} />
      </div>

      {/* ─── Page tabs: Räknare / Skottkarta ─── */}
      <div className="px-4 pb-3">
        <div className="flex bg-secondary rounded-2xl p-1 gap-1">
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-all"
            disabled
          >
            <Shield className="w-4 h-4" />
            Räknare
          </button>
          <button
            onClick={goToGoalTracker}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-muted-foreground font-bold text-sm tap-scale hover:text-foreground hover:bg-card transition-all"
          >
            <Target className="w-4 h-4" />
            Skottkarta
          </button>
        </div>
      </div>

      {/* ─── Main content ─── */}
      <div className="flex-1 flex flex-col px-4 gap-3 overflow-y-auto pb-4">
        {/* Sport + Period selectors */}
        <div className="flex flex-col gap-2">
          <SportSelector
            selectedSport={match.sport}
            onSelectSport={changeSport}
            disabled={hasAnySaves}
          />
          <PeriodTabs
            sportConfig={sportConfig}
            currentPeriod={match.currentPeriod}
            periods={match.periods}
            onSelectPeriod={setCurrentPeriod}
          />
        </div>

        {/* ─── Score counters ─── */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <TeamCounter
            team="home"
            label={match.homeTeamName}
            count={currentPeriodCounts.home}
            totalCount={totals.home}
            isAnimating={animatingTeam === 'home'}
            onClick={() => addSave('home')}
            onLabelChange={(name) => setTeamName('home', name)}
            selectedGoalieId={homeGoalieId}
            onGoalieChange={setHomeGoalieId}
            showGoalieSelector={isLoggedIn}
            onShot={handleShot}
          />
          <TeamCounter
            team="away"
            label={match.awayTeamName}
            count={currentPeriodCounts.away}
            totalCount={totals.away}
            isAnimating={animatingTeam === 'away'}
            onClick={() => addSave('away')}
            onLabelChange={(name) => setTeamName('away', name)}
            selectedGoalieId={awayGoalieId}
            onGoalieChange={setAwayGoalieId}
            showGoalieSelector={isLoggedIn}
            onShot={handleShot}
          />
        </div>

        {/* ─── Actions ─── */}
        <MatchActions
          onShare={handleShare}
          onSave={handleSave}
          onShowHistory={() => setShowSavedMatches(true)}
          onShowTeams={() => setShowTeamsSheet(true)}
          onShowStats={() => setShowStatsSheet(true)}
          hasSavedMatches={savedMatches.length > 0}
          isLoggedIn={isLoggedIn}
        />

        {/* ─── Undo / Reset ─── */}
        <div className="flex gap-3 pb-safe">
          <button
            onClick={undo}
            disabled={match.history.length === 0}
            className="flex-1 py-3 rounded-xl bg-card border border-border text-undo font-semibold text-sm tap-scale disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          >
            ↩ Ångra
          </button>
          <button
            onClick={() => setShowResetDialog(true)}
            disabled={!hasAnySaves}
            className="flex-1 py-3 rounded-xl bg-card border border-border text-reset font-semibold text-sm tap-scale disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          >
            ⟳ Nollställ
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <ResetConfirmDialog open={showResetDialog} onOpenChange={setShowResetDialog} onConfirm={handleReset} />
      <SavedMatchesSheet open={showSavedMatches} onOpenChange={setShowSavedMatches} savedMatches={savedMatches} onLoadMatch={handleLoadMatch} onDeleteMatch={deleteMatch} />
      <AuthSheet open={showAuthSheet} onOpenChange={setShowAuthSheet} />
      <TeamsGoaliesSheet open={showTeamsSheet} onOpenChange={setShowTeamsSheet} />
      <StatsSheet open={showStatsSheet} onOpenChange={setShowStatsSheet} />
    </div>
  );
}
