import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, ShoppingBag, ShoppingCart, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
      toast({
        title: "Logout realizado",
        description: "Você saiu do sistema com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Não foi possível realizar o logout",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary/20 bg-gradient-wood backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-wheat" />
            <h1 className="font-western text-3xl text-wheat tracking-wide">Rebulliço</h1>
          </Link>
          
          <nav className="flex items-center gap-2">
            {!session && location.pathname === '/' && (
              <Link to="/admin">
                <Button 
                  variant="outline" 
                  className="border-wheat/50 text-wheat hover:bg-wheat/20 hover:text-wheat"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            
            {session && (
              <>
                {location.pathname !== '/' && (
                  <Link to="/">
                    <Button 
                      variant="ghost" 
                      className="text-wheat hover:bg-wheat/20"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Loja
                    </Button>
                  </Link>
                )}
                
                {location.pathname !== '/pdv' && (
                  <Link to="/pdv">
                    <Button 
                      variant="ghost" 
                      className="text-wheat hover:bg-wheat/20"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      PDV
                    </Button>
                  </Link>
                )}
                
                {location.pathname !== '/admin/dashboard' && (
                  <Link to="/admin/dashboard">
                    <Button 
                      variant="ghost" 
                      className="text-wheat hover:bg-wheat/20"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Produtos
                    </Button>
                  </Link>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="border-wheat/50 text-wheat hover:bg-wheat/20 hover:text-wheat"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}