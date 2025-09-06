import { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Customer } from '@/types/payment';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    address: '',
    credit_limit: 0,
    discount_percentage: 0,
    is_active: true
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.document?.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error('Erro ao carregar clientes');
      return;
    }
    
    setCustomers(data || []);
    setFilteredCustomers(data || []);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      document: customer.document || '',
      address: customer.address || '',
      credit_limit: Number(customer.credit_limit) || 0,
      discount_percentage: Number(customer.discount_percentage) || 0,
      is_active: customer.is_active
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (editingCustomer) {
      const { error } = await supabase
        .from('customers')
        .update(formData)
        .eq('id', editingCustomer.id);
      
      if (error) {
        toast.error('Erro ao atualizar cliente');
        return;
      }
      
      toast.success('Cliente atualizado!');
    } else {
      const { error } = await supabase
        .from('customers')
        .insert([formData]);
      
      if (error) {
        toast.error('Erro ao criar cliente');
        return;
      }
      
      toast.success('Cliente criado!');
    }

    setShowForm(false);
    setEditingCustomer(null);
    resetForm();
    loadCustomers();
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', deleteId);
    
    if (error) {
      toast.error('Erro ao excluir cliente');
      return;
    }
    
    toast.success('Cliente excluído!');
    setDeleteId(null);
    loadCustomers();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      document: '',
      address: '',
      credit_limit: 0,
      discount_percentage: 0,
      is_active: true
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Layout title="Gerenciar Clientes">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email, telefone ou documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Button 
            onClick={() => {
              resetForm();
              setEditingCustomer(null);
              setShowForm(true);
            }}
            className="bg-gradient-country hover:opacity-90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        <Card className="border-primary/30">
          <CardContent className="p-0">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Clique em "Novo Cliente" para começar.
                  </p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/30">
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Limite</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="border-primary/30">
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email || '-'}</TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell>{customer.document || '-'}</TableCell>
                      <TableCell>
                        {customer.discount_percentage ? `${customer.discount_percentage}%` : '-'}
                      </TableCell>
                      <TableCell>
                        {customer.credit_limit ? formatCurrency(Number(customer.credit_limit)) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={customer.is_active ? "default" : "secondary"}
                          className={customer.is_active 
                            ? "bg-moss text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                          }
                        >
                          {customer.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(customer)}
                            className="border-primary/30"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteId(customer.id)}
                            className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do cliente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="document">CPF/CNPJ</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => setFormData({...formData, document: e.target.value})}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount">Desconto (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({...formData, discount_percentage: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="credit">Limite de Crédito</Label>
                <Input
                  id="credit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.credit_limit}
                  onChange={(e) => setFormData({...formData, credit_limit: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingCustomer ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}