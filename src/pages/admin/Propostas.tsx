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
import { Search, Eye, CheckCircle, XCircle, Clock, DollarSign, FileText, User, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPropostas() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const proposals = [
    {
      id: "P001245",
      client: "João Silva",
      clientId: "C001",
      type: "Veículo",
      vehicle: "Honda Civic 2022",
      plate: "ABC-1234",
      value: 45000,
      premium: 1800,
      status: "Pendente",
      createdAt: "2024-01-20",
      agent: "Maria Santos",
      coverage: "Compreensiva"
    },
    {
      id: "P001246",
      client: "Ana Costa",
      clientId: "C004",
      type: "Residencial",
      property: "Casa 120m²",
      address: "Rua das Flores, 123",
      value: 350000,
      premium: 2400,
      status: "Aprovada",
      createdAt: "2024-01-19",
      agent: "Pedro Lima",
      coverage: "Total"
    },
    {
      id: "P001247",
      client: "Carlos Ferreira",
      clientId: "C005",
      type: "Celular",
      device: "iPhone 15 Pro",
      imei: "123456789012345",
      value: 8500,
      premium: 680,
      status: "Rejeitada",
      createdAt: "2024-01-18",
      agent: "Maria Santos",
      coverage: "Roubo/Furto"
    },
    {
      id: "P001248",
      client: "Pedro Oliveira",
      clientId: "C003",
      type: "Veículo",
      vehicle: "Toyota Corolla 2021",
      plate: "XYZ-9876",
      value: 85000,
      premium: 3400,
      status: "Análise",
      createdAt: "2024-01-17",
      agent: "Ana Silva",
      coverage: "Compreensiva"
    },
    {
      id: "P001249",
      client: "Maria Santos",
      clientId: "C002",
      type: "Residencial",
      property: "Apartamento 80m²",
      address: "Av. Principal, 456",
      value: 280000,
      premium: 1680,
      status: "Aprovada",
      createdAt: "2024-01-16",
      agent: "Pedro Lima",
      coverage: "Incêndio/Roubo"
    }
  ];

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (proposal.plate && proposal.plate.includes(searchTerm.toUpperCase()));
    const matchesStatus = filterStatus === "all" || proposal.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesType = filterType === "all" || proposal.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aprovada': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'rejeitada': return 'bg-red-100 text-red-800';
      case 'análise': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'veículo': return Car;
      case 'residencial': return FileText;
      case 'celular': return FileText;
      default: return FileText;
    }
  };

  const handleApprove = (proposalId: string) => {
    toast({
      title: "Proposta aprovada!",
      description: `Proposta ${proposalId} foi aprovada com sucesso.`,
    });
  };

  const handleReject = (proposalId: string) => {
    toast({
      title: "Proposta rejeitada",
      description: `Proposta ${proposalId} foi rejeitada.`,
      variant: "destructive"
    });
  };

  const pendingCount = proposals.filter(p => p.status === 'Pendente').length;
  const analysisCount = proposals.filter(p => p.status === 'Análise').length;

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
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="análise">Análise</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
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
          <CardTitle>Lista de Propostas ({filteredProposals.length})</CardTitle>
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
                <TableHead>Agente</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.map((proposal) => {
                const TypeIcon = getTypeIcon(proposal.type);
                return (
                  <TableRow key={proposal.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{proposal.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{proposal.client}</p>
                          <p className="text-sm text-muted-foreground">{proposal.clientId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{proposal.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {proposal.vehicle || proposal.property || proposal.device}
                          </p>
                          {proposal.plate && (
                            <p className="text-xs font-mono">{proposal.plate}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">
                          {proposal.value.toLocaleString('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        {proposal.premium.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {proposal.coverage}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(proposal.status)}>
                        {proposal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{proposal.agent}</p>
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
                              <DialogTitle>Detalhes da Proposta {proposal.id}</DialogTitle>
                              <DialogDescription>
                                Informações completas da proposta
                              </DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="details" className="w-full">
                              <TabsList>
                                <TabsTrigger value="details">Detalhes</TabsTrigger>
                                <TabsTrigger value="analysis">Análise</TabsTrigger>
                              </TabsList>
                              <TabsContent value="details" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Cliente</Label>
                                    <p className="text-sm">{proposal.client} ({proposal.clientId})</p>
                                  </div>
                                  <div>
                                    <Label>Tipo de Seguro</Label>
                                    <p className="text-sm">{proposal.type}</p>
                                  </div>
                                  <div>
                                    <Label>Valor Segurado</Label>
                                    <p className="text-sm">
                                      {proposal.value.toLocaleString('pt-BR', { 
                                        style: 'currency', 
                                        currency: 'BRL' 
                                      })}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Prêmio Anual</Label>
                                    <p className="text-sm text-green-600 font-medium">
                                      {proposal.premium.toLocaleString('pt-BR', { 
                                        style: 'currency', 
                                        currency: 'BRL' 
                                      })}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Cobertura</Label>
                                    <p className="text-sm">{proposal.coverage}</p>
                                  </div>
                                  <div>
                                    <Label>Agente Responsável</Label>
                                    <p className="text-sm">{proposal.agent}</p>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="analysis" className="space-y-4">
                                <div className="space-y-4">
                                  <div>
                                    <Label>Status Atual</Label>
                                    <Badge className={getStatusColor(proposal.status)}>
                                      {proposal.status}
                                    </Badge>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      className="flex-1"
                                      onClick={() => handleApprove(proposal.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Aprovar
                                    </Button>
                                    <Button 
                                      variant="destructive"
                                      className="flex-1"
                                      onClick={() => handleReject(proposal.id)}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Rejeitar
                                    </Button>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                        
                        {proposal.status === 'Pendente' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleApprove(proposal.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleReject(proposal.id)}
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