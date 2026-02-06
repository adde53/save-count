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

export default function SaveCounter() {
  const navigate = useNavigate();
  const {
    match,
    savedMatches,
    animatingTeam,
    isLoggedIn,
    changeSport,
    setTeamName,
    setCurrentPeriod,
    addSave,
    undo,
    reset,
    saveMatch,
    loadMatch,
    deleteMatch,
    getShareUrl,
    homeGoalieId,
    awayGoalieId,
    setHomeGoalieId,
    setAwayGoalieId,
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
      } catch {
        // User cancelled or error
      }
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
    // For 'save' outcome, also increment the counter
    if (outcome === 'save') {
      addSave(team);
    }
    // TODO: Track shot events when full integration is needed
  };

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] p-4 gap-3">
      {/* Header */}
      <header className="flex items-center justify-between py-1">
        <h1 className="text-lg font-semibold text-muted-foreground tracking-wide uppercase">
          Räddningar
        </h1>
        <UserMenu onLoginClick={() => setShowAuthSheet(true)} />
      </header>

      {/* Sport Selector */}
      <SportSelector
        selectedSport={match.sport}
        onSelectSport={changeSport}
        disabled={hasAnySaves}
      />

      {/* Period Tabs */}
      <PeriodTabs
        sportConfig={sportConfig}
        currentPeriod={match.currentPeriod}
        periods={match.periods}
        onSelectPeriod={setCurrentPeriod}
      />

      {/* Counters */}
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

      {/* Match Actions */}
      <MatchActions
        onShare={handleShare}
        onSave={handleSave}
        onShowHistory={() => setShowSavedMatches(true)}
        onShowTeams={() => setShowTeamsSheet(true)}
        onShowStats={() => setShowStatsSheet(true)}
        onGoalTracker={() => navigate(`/goal-tracker?sport=${match.sport}&home=${encodeURIComponent(match.homeTeamName)}&away=${encodeURIComponent(match.awayTeamName)}`)}
        hasSavedMatches={savedMatches.length > 0}
        isLoggedIn={isLoggedIn}
      />

      {/* Controls */}
      <div className="flex gap-3 pb-safe">
        <button
          onClick={undo}
          disabled={match.history.length === 0}
          className="flex-1 py-4 rounded-xl bg-secondary text-undo font-semibold text-lg tap-scale disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          aria-label="Ångra senaste"
        >
          ↩ Ångra
        </button>
        <button
          onClick={() => setShowResetDialog(true)}
          disabled={!hasAnySaves}
          className="flex-1 py-4 rounded-xl bg-secondary text-reset font-semibold text-lg tap-scale disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          aria-label="Nollställ match"
        >
          ⟳ Nollställ
        </button>
      </div>

      {/* Dialogs */}
      <ResetConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        onConfirm={handleReset}
      />

      <SavedMatchesSheet
        open={showSavedMatches}
        onOpenChange={setShowSavedMatches}
        savedMatches={savedMatches}
        onLoadMatch={handleLoadMatch}
        onDeleteMatch={deleteMatch}
      />

      <AuthSheet
        open={showAuthSheet}
        onOpenChange={setShowAuthSheet}
      />

      <TeamsGoaliesSheet
        open={showTeamsSheet}
        onOpenChange={setShowTeamsSheet}
      />

      <StatsSheet
        open={showStatsSheet}
        onOpenChange={setShowStatsSheet}
      />
    </div>
  );
}
