import { useState } from 'react';
import { Plus, Trash2, Edit2, Users, User } from 'lucide-react';
import { useTeamsAndGoalies, Team, Goalie } from '@/hooks/useTeamsAndGoalies';
import { useAuth } from '@/hooks/useAuth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface TeamsGoaliesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TeamsGoaliesSheet({ open, onOpenChange }: TeamsGoaliesSheetProps) {
  const { user } = useAuth();
  const { teams, goalies, addTeam, updateTeam, deleteTeam, addGoalie, updateGoalie, deleteGoalie } = useTeamsAndGoalies();
  
  const [activeTab, setActiveTab] = useState<'teams' | 'goalies'>('teams');
  const [newTeamName, setNewTeamName] = useState('');
  const [newGoalieName, setNewGoalieName] = useState('');
  const [newGoalieTeam, setNewGoalieTeam] = useState<string>('none');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingGoalie, setEditingGoalie] = useState<Goalie | null>(null);

  if (!user) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[50vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Lag & Målvakter</SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Logga in för att hantera lag och målvakter</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      await addTeam(newTeamName.trim());
      setNewTeamName('');
      toast.success('Lag tillagt!');
    } catch {
      toast.error('Kunde inte lägga till lag');
    }
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam || !editingTeam.name.trim()) return;
    try {
      await updateTeam(editingTeam.id, editingTeam.name.trim());
      setEditingTeam(null);
      toast.success('Lag uppdaterat!');
    } catch {
      toast.error('Kunde inte uppdatera lag');
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      await deleteTeam(id);
      toast.success('Lag borttaget!');
    } catch {
      toast.error('Kunde inte ta bort lag');
    }
  };

  const handleAddGoalie = async () => {
    if (!newGoalieName.trim()) return;
    try {
      await addGoalie(newGoalieName.trim(), newGoalieTeam === 'none' ? null : newGoalieTeam);
      setNewGoalieName('');
      setNewGoalieTeam('none');
      toast.success('Målvakt tillagd!');
    } catch {
      toast.error('Kunde inte lägga till målvakt');
    }
  };

  const handleUpdateGoalie = async () => {
    if (!editingGoalie || !editingGoalie.name.trim()) return;
    try {
      await updateGoalie(editingGoalie.id, editingGoalie.name.trim(), editingGoalie.team_id);
      setEditingGoalie(null);
      toast.success('Målvakt uppdaterad!');
    } catch {
      toast.error('Kunde inte uppdatera målvakt');
    }
  };

  const handleDeleteGoalie = async (id: string) => {
    try {
      await deleteGoalie(id);
      toast.success('Målvakt borttagen!');
    } catch {
      toast.error('Kunde inte ta bort målvakt');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Lag & Målvakter</SheetTitle>
        </SheetHeader>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 mb-4">
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'teams'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            Lag ({teams.length})
          </button>
          <button
            onClick={() => setActiveTab('goalies')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'goalies'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            Målvakter ({goalies.length})
          </button>
        </div>

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-4">
            {/* Add Team Form */}
            <div className="flex gap-2">
              <Input
                placeholder="Nytt lagnamn..."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
                className="bg-secondary"
              />
              <Button onClick={handleAddTeam} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Teams List */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {teams.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Inga lag ännu</p>
              ) : (
                teams.map((team) => (
                  <div key={team.id} className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
                    {editingTeam?.id === team.id ? (
                      <>
                        <Input
                          value={editingTeam.name}
                          onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                          className="flex-1 bg-secondary"
                          autoFocus
                        />
                        <Button size="sm" onClick={handleUpdateTeam}>Spara</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingTeam(null)}>Avbryt</Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium">{team.name}</span>
                        <button
                          onClick={() => setEditingTeam(team)}
                          className="p-2 rounded hover:bg-secondary"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="p-2 rounded hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Goalies Tab */}
        {activeTab === 'goalies' && (
          <div className="space-y-4">
            {/* Add Goalie Form */}
            <div className="flex gap-2">
              <Input
                placeholder="Namn på målvakt..."
                value={newGoalieName}
                onChange={(e) => setNewGoalieName(e.target.value)}
                className="flex-1 bg-secondary"
              />
              <Select value={newGoalieTeam} onValueChange={setNewGoalieTeam}>
                <SelectTrigger className="w-32 bg-secondary">
                  <SelectValue placeholder="Lag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Inget lag</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddGoalie} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Goalies List */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {goalies.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Inga målvakter ännu</p>
              ) : (
                goalies.map((goalie) => (
                  <div key={goalie.id} className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
                    {editingGoalie?.id === goalie.id ? (
                      <>
                        <Input
                          value={editingGoalie.name}
                          onChange={(e) => setEditingGoalie({ ...editingGoalie, name: e.target.value })}
                          className="flex-1 bg-secondary"
                          autoFocus
                        />
                        <Select 
                          value={editingGoalie.team_id || 'none'} 
                          onValueChange={(v) => setEditingGoalie({ ...editingGoalie, team_id: v === 'none' ? null : v })}
                        >
                          <SelectTrigger className="w-32 bg-secondary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Inget lag</SelectItem>
                            {teams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={handleUpdateGoalie}>Spara</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingGoalie(null)}>Avbryt</Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="font-medium">{goalie.name}</div>
                          {goalie.team_name && (
                            <div className="text-xs text-muted-foreground">{goalie.team_name}</div>
                          )}
                        </div>
                        <button
                          onClick={() => setEditingGoalie(goalie)}
                          className="p-2 rounded hover:bg-secondary"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoalie(goalie.id)}
                          className="p-2 rounded hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
