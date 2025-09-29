import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Eye, Search, Filter, Car, Home, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePolicies, type Policy } from '@/hooks/usePolicies';
import { apiService } from '@/lib/api';

export default function Apolices() {
  const { toast } = useToast();
  const { policies, stats, loading } = usePolicies();
  const [query, setQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'todos' | 'veiculo' | 'residencial' | 'celular'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'pendente' | 'cancelado'>('todos');
  const [selected, setSelected] = useState<Policy | null>(null);

  const filtered = useMemo(() => {
    return policies.filter((p) => {
      const matchQuery = !query || `${p.id} ${p.tipo} ${p.objeto}`.toLowerCase().includes(query.toLowerCase());
      const matchTipo =
        tipoFilter === 'todos' ||
        (tipoFilter === 'veiculo' && p.tipo === 'Veículo') ||
        (tipoFilter === 'residencial' && p.tipo === 'Residencial') ||
        (tipoFilter === 'celular' && p.tipo === 'Celular');
      const matchStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'ativo' && p.status === 'Ativo') ||
        (statusFilter === 'pendente' && p.status === 'Pendente') ||
        (statusFilter === 'cancelado' && p.status === 'Cancelado');
      return matchQuery && matchTipo && matchStatus;
    });
  }, [policies, query, tipoFilter, statusFilter]);

  const handleClearFilters = () => {
    setQuery('');
    setTipoFilter('todos');
    setStatusFilter('todos');
  };

  const tryPrintFallback = (p: Policy) => {
    const w = window.open('', '_blank');
    if (!w) return;
    const html = `
      <html>
        <head>
          <title>Apólice ${p.id}</title>
          <meta charset="utf-8" />
          <style>
            body{ font-family: Arial, sans-serif; padding:24px; }
            h1{ font-size:20px; }
            .row{ margin:8px 0; }
            .label{ color:#666; font-size:12px; }
            .value{ font-size:14px; }
          </style>
        </head>
        <body>
          <h1>Apólice ${p.id}</h1>
          <div class="row"><span class="label">Tipo:</span> <span class="value">${p.tipo}</span></div>
          <div class="row"><span class="label">Objeto:</span> <span class="value">${p.objeto}</span></div>
          <div class="row"><span class="label">Status:</span> <span class="value">${p.status}</span></div>
          <div class="row"><span class="label">Vigência:</span> <span class="value">${p.vigencia}</span></div>
          <div class="row"><span class="label">Valor:</span> <span class="value">${p.valor}</span></div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;
    w.document.write(html);
    w.document.close();
  };

  const handleDownload = async (p: Policy) => {
    try {
      // Tenta baixar do backend se existir endpoint
      const blob = await apiService.downloadPolicyPdf?.(p.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `apolice-${p.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }
      // Fallback para impressão/salvar em PDF
      toast({ title: 'Gerando PDF', description: 'Abrindo visualização para salvar em PDF.' });
      tryPrintFallback(p);
    } catch (e) {
      // Fallback para impressão/salvar em PDF
      toast({ title: 'Gerando PDF', description: 'Abrindo visualização para salvar em PDF.' });
      tryPrintFallback(p);
    }
  };

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
              <Input placeholder="Buscar apólice..." className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            
            <Select value={tipoFilter} onValueChange={(v: any) => setTipoFilter(v)}>
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

            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
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

            <Button variant="outline" className="w-full" onClick={handleClearFilters}>
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
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.ativas}</p>
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
                <p className="text-2xl font-bold">{stats.pendentes}</p>
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
                <p className="text-2xl font-bold">{stats.canceladas}</p>
                <p className="text-sm text-muted-foreground">Canceladas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Apólices */}
      <div className="space-y-4">
        {filtered.map((apolice) => {
          const IconeComponent = apolice.tipo === 'Veículo' ? Car : apolice.tipo === 'Residencial' ? Home : Smartphone;
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
                      <Button variant="outline" size="sm" onClick={() => setSelected(apolice)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      
                      {apolice.status === 'Ativo' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(apolice)}
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

      {/* Modal Visualização */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Apólice {selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2">
              <div><strong>Tipo:</strong> {selected.tipo}</div>
              <div><strong>Objeto:</strong> {selected.objeto}</div>
              <div><strong>Status:</strong> {selected.status}</div>
              <div><strong>Vigência:</strong> {selected.vigencia}</div>
              <div><strong>Valor:</strong> {selected.valor}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}