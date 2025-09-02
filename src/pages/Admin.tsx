import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLogin } from '@/components/AdminLogin';
import { auth } from '@/lib/auth';

export default function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se já está autenticado
    const checkAuth = async () => {
      const session = await auth.getSession();
      if (session) {
        navigate('/admin/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  return <AdminLogin />;
}