import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, CheckCircle, XCircle, Clock, DollarSign, House, User, Car, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getSegurosPendentes, postEfetivaSeguro } from "@/service";
import { EfetivaSeguroDto, SegurosPendentesV2Res } from "@/service/interface";

export default function AdminPropostas() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterType, setFilterType] = useState(null);

  const query = useQuery({
    queryKey: ['seguros-pendentes-v2'],
    queryFn: () => getSegurosPendentes()
  });

  const atualizaSeguro = useMutation({
    mutationKey: ['efetiva-seguro'],
    mutationFn: postEfetivaSeguro
  });

  const segurosPendentes = (query.data as SegurosPendentesV2Res[]) ?? [];

  console.log(segurosPendentes)

  // show basic loading / error UI to avoid accessing undefined
  if (query.isLoading) return <div>Carregando propostas...</div>;
  if (query.isError) return <div>Erro ao carregar propostas.</div>;

  // const filteredProposals = segurosPendentes.filter(proposal => {
  //   const matchesStatus = filterStatus === null || proposal.status === filterStatus;
  //   const matchesType = filterType === null || proposal.idSeguro === filterType;
  // });

  const getStatusColor = (status: string) => {
    switch (status) {
      case '0': return 'bg-yellow-100 text-yellow-800';
      case '1': return 'bg-red-100 text-red-800';
      case '2': return 'bg-blue-100 text-blue-800';
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
  const analysisCount = segurosPendentes.filter(p => p.status === '1').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Propostas</h1>
          <p className="text-muted-foreground">
            Gerencie e analise todas as propostas de seguro
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            {pendingCount} Pendentes
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {analysisCount} Em Análise
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
            <div className="space-y-2 flex-1">
              <Label htmlFor="search">Buscar Proposta</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cliente, ID da proposta ou placa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">null</SelectItem>
                  <SelectItem value="pendente">0</SelectItem>
                  <SelectItem value="análise">1</SelectItem>
                  <SelectItem value="aprovada">2</SelectItem>
                  <SelectItem value="rejeitada">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="veículo">Veículo</SelectItem>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="celular">Celular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">Limpar Filtros</Button>
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
              {segurosPendentes.map((proposal, index) => {
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
                        <span className="font-medium">{(proposal.vlrProdutoSegurado)}</span>
                      </div>
                    </TableCell>

                    {/* Prêmio */}
                    <TableCell>
                      <div className="font-medium text-green-600">
                        {(proposal.premioBruto)}
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