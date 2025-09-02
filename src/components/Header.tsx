import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, ShoppingBag } from 'lucide-react';
import { storageUtils } from '@/utils/localStorage';
import { useState, useEffect } from 'react';

export function Header() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(storageUtils.isAdminAuthenticated());
  }, [location]);

  const handleLogout = () => {
    storageUtils.setAdminAuth(false);
    setIsAdmin(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary/20 bg-gradient-wood backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-wheat" />
            <h1 className="font-western text-3xl text-wheat tracking-wide">Rebulliço</h1>
          </Link>
          
          <nav className="flex items-center gap-4">
            {location.pathname === '/' && (
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
            
            {isAdmin && location.pathname.startsWith('/admin') && (
              <>
                <Link to="/">
                  <Button 
                    variant="outline" 
                    className="border-wheat/50 text-wheat hover:bg-wheat/20 hover:text-wheat"
                  >
                    Ver Loja
                  </Button>
                </Link>
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