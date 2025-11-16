import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Eye, Search, Filter, Car, Home, Smartphone, House } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePolicies, type Policy } from '@/hooks/usePolicies';
import { apiService } from '@/lib/api';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GetSegurosPendentesByCpfRes } from '@/service/interface';

export default function Apolices() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'todos' | 'veiculo' | 'residencial' | 'celular'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'pendente' | 'cancelado'>('todos');
  const [selected, setSelected] = useState<Policy | null>(null);
  const queryClient = useQueryClient();
  const policies = queryClient.getQueryData(['seguros-pendentes-by-cpf']) as GetSegurosPendentesByCpfRes;
  console.log('policies', policies)

  const getTypeIcon = (type: number) => {
    switch (type) {
      case 1: return Car;
      case 2: return Smartphone;
      case 3: return House;
      default: return undefined;
    }
  };


  // const filtered = useMemo(() => {
  //   return policies.segurosAtivos.filter((p) => {
  //     const matchQuery = !query || `${p.apoliceId} ${p.idSeguro} ${p.objeto}`.toLowerCase().includes(query.toLowerCase());
  //     const matchTipo =
  //       tipoFilter === 'todos' ||
  //       (tipoFilter === 'veiculo' && p.tipo === 'Veículo') ||
  //       (tipoFilter === 'residencial' && p.tipo === 'Residencial') ||
  //       (tipoFilter === 'celular' && p.tipo === 'Celular');
  //     const matchStatus =
  //       statusFilter === 'todos' ||
  //       (statusFilter === 'ativo' && p.status === 'Ativo') ||
  //       (statusFilter === 'pendente' && p.status === 'Pendente') ||
  //       (statusFilter === 'cancelado' && p.status === 'Cancelado');
  //     return matchQuery && matchTipo && matchStatus;
  //   });
  // }, [policies, query, tipoFilter, statusFilter]);

  const handleClearFilters = () => {
    setQuery('');
    setTipoFilter('todos');
    setStatusFilter('todos');
  };


  const getStatusLabel = (status: string) => {
    switch (status) {
      case '0': return 'Em Análise';
      case '1': return 'Aprovada';
      case '2': return 'Rejeitada';
    }
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


  // if (isLoading) {
  //   return <div>Carregando apólices...</div>;
  // }

  // if (isError) {
  //   return <div>Erro ao carregar apólices.</div>;
  // }

  const segurosAtivos = policies?.segurosAtivos || [];
  const segurosPendentes = policies?.segurosPendentes || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Minhas Apólices</h1>
        <p className="text-muted-foreground">
          Gerencie suas apólices e veja detalhes sobre seus seguros.
        </p>
      </div>

      {/* Tabela de Apólices Ativas */}
      <Card>
        <CardHeader>
          <CardTitle>Apólices Ativas ({segurosAtivos.length})</CardTitle>
          <CardDescription>Lista de seguros ativos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apólice</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo/Objeto</TableHead>
                <TableHead>Valor Segurado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vigência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segurosAtivos.map((policy) => {
                const TypeIcon = getTypeIcon(policy.idSeguro);
                return (
                  <TableRow key={policy.apoliceId}>
                    <TableCell>{policy.apoliceId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{policy.desUsuario}</p>
                        <p className="text-sm text-muted-foreground">{policy.cpfCliente}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{policy.produtoNome}</p>
                          <p className="text-sm text-muted-foreground">{policy.produtoSegurado}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{policy.vlrProdutoSegurado ? `R$ ${policy.vlrProdutoSegurado}` : '-'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(policy.status)}>
                        {getStatusLabel(policy.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {policy.inicioVigencia} - {policy.fimVigencia}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabela de Apólices Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle>Apólices Pendentes ({segurosPendentes.length})</CardTitle>
          <CardDescription>Lista de seguros pendentes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apólice</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo/Objeto</TableHead>
                <TableHead>Valor Segurado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vigência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segurosPendentes.map((policy) => {
                const TypeIcon = getTypeIcon(policy.idSeguro);
                return (
                  <TableRow key={policy.apoliceId}>
                    <TableCell>{policy.apoliceId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{policy.desUsuario}</p>
                        <p className="text-sm text-muted-foreground">{policy.cpfCliente}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{policy.produtoNome}</p>
                          <p className="text-sm text-muted-foreground">{policy.produtoSegurado}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{policy.vlrProdutoSegurado ? `R$ ${policy.vlrProdutoSegurado}` : '-'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(policy.status)}>
                        {getStatusLabel(policy.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {policy.inicioVigencia} - {policy.fimVigencia}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}