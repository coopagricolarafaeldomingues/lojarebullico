import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAuth } from '@/components/AdminAuth';
import { storageUtils } from '@/utils/localStorage';

export default function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Se já estiver autenticado, redireciona para o dashboard
    if (storageUtils.isAdminAuthenticated()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  return <AdminAuth />;
}