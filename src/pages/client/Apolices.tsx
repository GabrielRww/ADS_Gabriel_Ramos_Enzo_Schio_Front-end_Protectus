import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Eye, Search, Filter, Car, Home, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Apolices() {
  const { toast } = useToast();

  const handleDownload = (apoliceId: string) => {
    toast({
      title: "Download iniciado",
      description: `A apólice ${apoliceId} está sendo baixada.`,
    });
  };

  const apolices = [
    {
      id: 'AP001',
      tipo: 'Veículo',
      objeto: 'Honda Civic - ABC-1234',
      status: 'Ativo',
      vigencia: '23/05/2024 - 23/05/2025',
      valor: 'R$ 149,90/mês',
      icone: Car,
      cor: 'success'
    },
    {
      id: 'AP002',
      tipo: 'Residencial',
      objeto: 'Rua das Flores, 123',
      status: 'Ativo',
      vigencia: '15/08/2024 - 15/08/2025',
      valor: 'R$ 89,90/mês',
      icone: Home,
      cor: 'success'
    },
    {
      id: 'AP003',
      tipo: 'Celular',
      objeto: 'iPhone 14 Pro',
      status: 'Pendente',
      vigencia: 'Aguardando aprovação',
      valor: 'R$ 29,90/mês',
      icone: Smartphone,
      cor: 'warning'
    },
    {
      id: 'AP004',
      tipo: 'Veículo',
      objeto: 'Toyota Corolla - XYZ-5678',
      status: 'Cancelado',
      vigencia: '10/01/2024 - 10/01/2025',
      valor: 'R$ 134,90/mês',
      icone: Car,
      cor: 'destructive'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-success-light text-success';
      case 'Pendente':
        return 'bg-warning-light text-warning';
      case 'Cancelado':
        return 'bg-destructive-light text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Minhas Apólices</h1>
        <p className="text-muted-foreground">
          Gerencie suas apólices e baixe documentos
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar apólice..." className="pl-10" />
            </div>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de seguro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="veiculo">Veículo</SelectItem>
                <SelectItem value="residencial">Residencial</SelectItem>
                <SelectItem value="celular">Celular</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">Total de Apólices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-success-light rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-success rounded-full"></div>
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-warning-light rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-warning rounded-full"></div>
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-destructive-light rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-destructive rounded-full"></div>
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Canceladas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Apólices */}
      <div className="space-y-4">
        {apolices.map((apolice) => {
          const IconeComponent = apolice.icone;
          return (
            <Card key={apolice.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                      <IconeComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{apolice.tipo}</h3>
                        <Badge className={getStatusColor(apolice.status)}>
                          {apolice.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{apolice.objeto}</p>
                      <p className="text-sm text-muted-foreground">
                        Apólice: {apolice.id} | Vigência: {apolice.vigencia}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end space-y-2">
                    <div className="text-right">
                      <p className="font-semibold text-primary">{apolice.valor}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      
                      {apolice.status === 'Ativo' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(apolice.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Principais ações para suas apólices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <FileText className="h-6 w-6" />
              <span>Solicitar 2ª Via</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Download className="h-6 w-6" />
              <span>Baixar Todas</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Eye className="h-6 w-6" />
              <span>Histórico Completo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}