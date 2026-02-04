import { useAuth } from '@/hooks/useAuth';
import { User, LogOut } from 'lucide-react';

interface UserMenuProps {
  onLoginClick: () => void;
}

export default function UserMenu({ onLoginClick }: UserMenuProps) {
  const { user, signOut } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
          {user.email}
        </span>
        <button
          onClick={signOut}
          className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground tap-scale"
          aria-label="Logga ut"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onLoginClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium tap-scale"
    >
      <User className="w-4 h-4" />
      Logga in
    </button>
  );
}
