import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    monthSales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    todayTransactions: 0,
    changeToday: 0,
    changeMonth: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Vendas de hoje
    const { data: todaySales } = await supabase
      .from('sales')
      .select('total')
      .gte('created_at', today.toISOString())
      .not('is_return', 'eq', true);
    
    // Vendas do mês
    const { data: monthSales } = await supabase
      .from('sales')
      .select('total')
      .gte('created_at', firstDayOfMonth.toISOString())
      .not('is_return', 'eq', true);
    
    // Total de produtos
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    // Total de clientes
    const { count: customersCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
    
    // Produtos com estoque baixo
    const { data: lowStock } = await supabase
      .from('product_variants')
      .select('stock_quantity, min_stock');
    
    // Transações de hoje
    const { count: todayTransCount } = await supabase
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());
    
    const todayTotal = todaySales?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
    const monthTotal = monthSales?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
    
    // Filtrar produtos com estoque baixo
    const lowStockItems = lowStock?.filter((item: any) => 
      item.stock_quantity < item.min_stock
    ) || [];
    
    setStats({
      todaySales: todayTotal,
      monthSales: monthTotal,
      totalProducts: productsCount || 0,
      totalCustomers: customersCount || 0,
      lowStockCount: lowStockItems.length,
      todayTransactions: todayTransCount || 0,
      changeToday: 12.5, // Calcular com base em dados históricos
      changeMonth: 18.2  // Calcular com base em dados históricos
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const statsCards = [
    {
      title: "Vendas Hoje",
      value: formatCurrency(stats.todaySales),
      change: stats.changeToday,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Vendas do Mês",
      value: formatCurrency(stats.monthSales),
      change: stats.changeMonth,
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Produtos",
      value: stats.totalProducts.toString(),
      change: 0,
      icon: Package,
      color: "text-purple-600"
    },
    {
      title: "Clientes",
      value: stats.totalCustomers.toString(),
      change: 0,
      icon: Users,
      color: "text-orange-600"
    },
  ];

  const alerts = [
    ...(stats.lowStockCount > 0 ? [{
      type: "Estoque Baixo",
      message: `${stats.lowStockCount} produtos com estoque abaixo do mínimo`,
      severity: "warning" as const
    }] : []),
    {
      type: "Transações Hoje",
      message: `${stats.todayTransactions} vendas realizadas`,
      severity: "info" as const
    }
  ];

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change !== 0 && (
                  <p className={cn(
                    "text-xs flex items-center mt-1",
                    stat.change > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {stat.change > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(stat.change)}%
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alerts Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Avisos e Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border",
                    alert.severity === "warning" && "bg-yellow-50 border-yellow-200",
                    alert.severity === "info" && "bg-blue-50 border-blue-200"
                  )}
                >
                  <p className="font-medium text-sm">{alert.type}</p>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => window.location.href = '/pdv'}>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <ShoppingCart className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold">Abrir PDV</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Iniciar nova venda
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => window.location.href = '/admin/products'}>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Package className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold">Gerenciar Produtos</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Adicionar ou editar produtos
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => window.location.href = '/admin/reports'}>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <TrendingUp className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold">Ver Relatórios</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Análise de vendas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}