import { useAuth } from '@/hooks/useAuth';
import AuthForm from './AuthForm';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface AuthSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthSheet({ open, onOpenChange }: AuthSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Konto</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <AuthForm onSuccess={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
