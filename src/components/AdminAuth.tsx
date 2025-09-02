import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { storageUtils } from '@/utils/localStorage';
import { toast } from 'sonner';

export function AdminAuth() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Senha padrão: "admin123" - Em produção, use um sistema mais seguro
    if (password === 'admin123') {
      storageUtils.setAdminAuth(true);
      toast.success('Login realizado com sucesso!');
      navigate('/admin/dashboard');
    } else {
      toast.error('Senha incorreta!');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-primary/30 bg-card/95 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-country flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-western text-2xl">Área Administrativa</CardTitle>
          <CardDescription>
            Digite a senha para acessar o painel de administração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-primary/30 focus:ring-primary"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-country hover:opacity-90 text-primary-foreground"
            >
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}