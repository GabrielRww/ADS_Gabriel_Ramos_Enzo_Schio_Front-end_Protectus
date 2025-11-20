import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Search, Eye, CheckCircle, XCircle, House, User, Car, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getSegurosPendentes, postEfetivaSeguro } from "@/service";
import { EfetivaSeguroDto, SegurosPendentesV2Res } from "@/service/interface";
import { formatToBrazilianReal } from "@/utils/functions";

export default function AdminPropostas() {
  const { toast } = useToast();
  type StatusFilter = 'all' | '0' | '1' | '2';
  type TipoFilter = 'all' | 'veiculo' | 'residencial' | 'celular';

  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterType, setFilterType] = useState<TipoFilter>('all');

  const query = useQuery({
    queryKey: ['seguros-pendentes-v2'],
    queryFn: () => getSegurosPendentes()
  });

  const atualizaSeguro = useMutation({
    mutationKey: ['efetiva-seguro'],
    mutationFn: postEfetivaSeguro
  });

  const segurosPendentes = useMemo(() => (query.data as SegurosPendentesV2Res[]) ?? [], [query.data]);

  const filteredSeguros = useMemo(() => {
    return segurosPendentes.filter((p: SegurosPendentesV2Res) => {
      const statusOk = filterStatus === 'all' || p.status === filterStatus;
      const tipoMap: Record<number, TipoFilter> = { 1: 'veiculo', 2: 'celular', 3: 'residencial' };
      const tipoSeguro = tipoMap[p.idSeguro] || 'all';
      const tipoOk = filterType === 'all' || filterType === tipoSeguro;
      return statusOk && tipoOk;
    });
  }, [segurosPendentes, filterStatus, filterType]);

  if (query.isLoading) return <div>Carregando propostas...</div>;
  if (query.isError) return <div>Erro ao carregar propostas.</div>;


  const getStatusColor = (status: string) => {
    switch (status) {
      case '0': return 'bg-yellow-100 text-yellow-800';
      case '1': return 'bg-blue-100 text-blue-800';
      case '2': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case '0': return 'Em Análise';
      case '1': return 'Aprovada';
      case '2': return 'Rejeitada';
    }
  };

  const getTypeIcon = (type: number) => {
    switch (type) {
      case 1: return Car;
      case 2: return Smartphone;
      case 3: return House;
      default: return undefined;
    }
  };

  const handleApprove = (data: EfetivaSeguroDto) => {
    atualizaSeguro.mutateAsync(
      data,
    ).then(() => query.refetch())
    toast({
      title: "Proposta aprovada!",
      description: `Proposta ${data.idApolice} foi aprovada com sucesso.`,
    });
  };

  const handleReject = (data: EfetivaSeguroDto) => {
    atualizaSeguro.mutateAsync(
      data,
    ).then(() => query.refetch())
    toast({
      title: "Proposta rejeitada",
      description: `Proposta ${data.idApolice} foi rejeitada.`,
      variant: "destructive"
    });
  };

  const pendingCount = segurosPendentes.filter(p => p.status === '0').length;
  const approvedCount = segurosPendentes.filter(p => p.status === '1').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Apólices</h1>
          <p className="text-muted-foreground">
            Gerencie e analise todas as propostas de seguro
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            {pendingCount} Pendentes
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {approvedCount} Aprovados
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Use os filtros para encontrar propostas específicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as StatusFilter)}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="0">Em Análise</SelectItem>
                  <SelectItem value="1">Aprovada</SelectItem>
                  <SelectItem value="2">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as TipoFilter)}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="veiculo">Veículo</SelectItem>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="celular">Celular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => { setFilterStatus('all'); setFilterType('all'); }}>Limpar Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Propostas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Propostas ({segurosPendentes.length})</CardTitle>
          <CardDescription>Todas as propostas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proposta</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo/Objeto</TableHead>
                <TableHead>Valor Segurado</TableHead>
                <TableHead>Prêmio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSeguros.map((proposal, index) => {
                const TypeIcon = getTypeIcon(proposal.idSeguro);
                return (
                  // 4) key única e estável
                  <TableRow key={`${proposal.apoliceId}-${proposal.idSeguro}-${index}`}>
                    {/* Proposta */}
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{proposal.apoliceId}</p>
                      </div>
                    </TableCell>

                    {/* Cliente */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{proposal.desUsuario}</p>
                          <p className="text-sm text-muted-foreground">{proposal.cpfCliente}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Tipo/Objeto */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{proposal.produtoNome}</p>
                          <p className="text-sm text-muted-foreground">{proposal.produtoSegurado}</p>
                          {proposal.placa ? <p className="text-xs font-mono">{'Placa: ' + proposal.placa}</p> : proposal.imei ? <p className="text-xs font-mono">{'Imei: ' + proposal.imei}</p> : null}
                        </div>
                      </div>
                    </TableCell>

                    {/* Valor Segurado */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{formatToBrazilianReal(String(proposal.vlrProdutoSegurado ?? '0'))}</span>
                      </div>
                    </TableCell>

                    {/* Prêmio */}
                    <TableCell>
                      <div className="font-medium text-green-600">
                        {formatToBrazilianReal(String(proposal.premioBruto ?? '0'))}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(proposal.status)}>
                        {getStatusLabel(proposal.status)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Detalhes da Proposta {proposal.apoliceId}</DialogTitle>
                              <DialogDescription>
                                Informações completas da proposta
                              </DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="details" className="w-full">
                              <TabsContent value="details" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Cliente</Label>
                                    <p className="text-sm">{proposal.desUsuario} ({proposal.cpfCliente})</p>
                                  </div>
                                  <div>
                                    <Label>Tipo de Seguro</Label>
                                    <p className="text-sm">{proposal.produtoNome}</p>
                                  </div>
                                  <div>
                                    <Label>Valor Segurado</Label>
                                    <p className="text-sm">
                                      {proposal.vlrProdutoSegurado}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Prêmio Anual</Label>
                                    <p className="text-sm text-green-600 font-medium">
                                      {proposal.premioBruto}
                                    </p>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>

                        {proposal.status === '0' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove({ ...proposal, idApolice: proposal.apoliceId, status: 1 })}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject({ ...proposal, idApolice: proposal.apoliceId, status: 2 })}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
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