import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Layers,
  CreditCard,
  Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  { name: "PDV", href: "/pdv", icon: ShoppingCart },
  { name: "Loja", href: "/", icon: Store },
  { name: "Produtos", href: "/admin/products", icon: Package },
  { name: "Variações", href: "/admin/variants", icon: Layers },
  { name: "Clientes", href: "/admin/customers", icon: Users },
  { name: "Formas Pagamento", href: "/admin/payments", icon: CreditCard },
  { name: "Relatórios", href: "/admin/reports", icon: BarChart3 },
  { name: "Configurações", href: "/admin/settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "flex flex-col h-full bg-primary text-primary-foreground transition-all duration-300",
      collapsed ? "w-16" : "w-60",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-light">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🤠</div>
            <h1 className="text-xl font-western">Rebulliço</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-primary-foreground hover:bg-primary-light"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-primary-light text-primary-foreground"
                  : "text-primary-foreground/70 hover:bg-primary-light hover:text-primary-foreground",
                collapsed && "justify-center"
              )}
            >
              <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-primary-light">
        {!collapsed && (
          <p className="text-xs text-primary-foreground/60 text-center">
            © 2025 Rebulliço
          </p>
        )}
      </div>
    </div>
  );
}