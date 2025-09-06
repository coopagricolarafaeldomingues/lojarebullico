import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/admin");
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">
          {title || "Dashboard"}
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="text-sm">{session?.user?.email}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}