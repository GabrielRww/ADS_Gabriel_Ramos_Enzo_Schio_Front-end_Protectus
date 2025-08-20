import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Eye, AlertTriangle, Shield, Clock, User, Car, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminIncidentes() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const incidents = [
    {
      id: "INC001",
      type: "Roubo/Furto",
      severity: "Alto",
      status: "Em Investigação",
      client: "João Silva",
      clientId: "C001",
      vehicle: "Honda Civic 2022",
      plate: "ABC-1234",
      trackerId: "RT001",
      location: "Rua das Palmeiras, 500 - São Paulo",
      datetime: "2024-01-21 08:30",
      reportedBy: "Cliente",
      agent: "Maria Santos",
      description: "Veículo foi furtado durante a madrugada na garagem residencial.",
      value: 45000,
      createdAt: "2024-01-21 09:15"
    },
    {
      id: "INC002",
      type: "Acidente",
      severity: "Médio",
      status: "Resolvido",
      client: "Ana Costa",
      clientId: "C004",
      vehicle: "Volkswagen Gol 2019",
      plate: "GHI-9012",
      trackerId: "RT004",
      location: "Av. Brasil, 1200 - Curitiba",
      datetime: "2024-01-20 14:45",
      reportedBy: "Terceiro",
      agent: "Pedro Lima",
      description: "Colisão traseira em semáforo. Danos materiais apenas.",
      value: 8500,
      createdAt: "2024-01-20 15:00"
    },
    {
      id: "INC003",
      type: "Vandalismo",
      severity: "Baixo",
      status: "Pendente",
      client: "Carlos Ferreira",
      clientId: "C005",
      vehicle: "Hyundai HB20 2020",
      plate: "DEF-5678",
      trackerId: "RT003",
      location: "Shopping Center - Salvador",
      datetime: "2024-01-19 16:20",
      reportedBy: "Cliente",
      agent: "Ana Silva",
      description: "Riscos na lataria e espelho quebrado no estacionamento.",
      value: 1200,
      createdAt: "2024-01-19 17:30"
    },
    {
      id: "INC004",
      type: "Quebra",
      severity: "Médio",
      status: "Em Análise",
      client: "Maria Santos",
      clientId: "C002",
      vehicle: "Toyota Corolla 2021",
      plate: "XYZ-9876",
      trackerId: "RT002",
      location: "Oficina Central - Rio de Janeiro",
      datetime: "2024-01-18 10:00",
      reportedBy: "Mecânico",
      agent: "Maria Santos",
      description: "Falha no sistema de freios identificada durante revisão.",
      value: 3500,
      createdAt: "2024-01-18 11:15"
    },
    {
      id: "INC005",
      type: "Rastreador Offline",
      severity: "Baixo",
      status: "Resolvido",
      client: "Pedro Oliveira",
      clientId: "C003",
      vehicle: "Fiat Uno 2018",
      plate: "JKL-3456",
      trackerId: "RT005",
      location: "Última posição: Centro - BH",
      datetime: "2024-01-17 22:15",
      reportedBy: "Sistema",
      agent: "Pedro Lima",
      description: "Dispositivo perdeu sinal GPS por mais de 4 horas.",
      value: 0,
      createdAt: "2024-01-17 22:15"
    }
  ];

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || incident.status.toLowerCase().includes(filterStatus.toLowerCase());
    const matchesType = filterType === "all" || incident.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolvido': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em investigação': return 'bg-blue-100 text-blue-800';
      case 'em análise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'alto': return 'bg-red-100 text-red-800';
      case 'médio': return 'bg-yellow-100 text-yellow-800';
      case 'baixo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'roubo/furto': return AlertTriangle;
      case 'acidente': return Car;
      case 'vandalismo': return Shield;
      case 'quebra': return FileText;
      default: return AlertTriangle;
    }
  };

  const handleAddIncident = () => {
    toast({
      title: "Incidente registrado!",
      description: "Novo incidente foi adicionado ao sistema.",
    });
    setIsDialogOpen(false);
  };

  const pendingCount = incidents.filter(i => i.status === 'Pendente').length;
  const investigationCount = incidents.filter(i => i.status === 'Em Investigação').length;
  const totalValue = incidents.reduce((sum, incident) => sum + incident.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registro de Incidentes</h1>
          <p className="text-muted-foreground">
            Gerencie todas as ocorrências e sinistros
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            {pendingCount} Pendentes
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {investigationCount} Em Investigação
          </Badge>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Incidente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Registrar Novo Incidente</DialogTitle>
                <DialogDescription>
                  Adicione uma nova ocorrência ao sistema
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="C001">João Silva</SelectItem>
                        <SelectItem value="C002">Maria Santos</SelectItem>
                        <SelectItem value="C003">Pedro Oliveira</SelectItem>
                        <SelectItem value="C004">Ana Costa</SelectItem>
                        <SelectItem value="C005">Carlos Ferreira</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Incidente</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="roubo">Roubo/Furto</SelectItem>
                        <SelectItem value="acidente">Acidente</SelectItem>
                        <SelectItem value="vandalismo">Vandalismo</SelectItem>
                        <SelectItem value="quebra">Quebra</SelectItem>
                        <SelectItem value="rastreador">Rastreador Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severidade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a severidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixo">Baixo</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor Estimado (R$)</Label>
                    <Input id="value" type="number" placeholder="0,00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Local da Ocorrência</Label>
                  <Input id="location" placeholder="Endereço completo..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição do Incidente</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Descreva detalhadamente o que aconteceu..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddIncident}>Registrar Incidente</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Incidentes</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents.length}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Em sinistros reportados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((incidents.filter(i => i.status === 'Resolvido').length / incidents.length) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Casos resolvidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 dias</div>
            <p className="text-xs text-muted-foreground">
              Para resolução
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Use os filtros para encontrar incidentes específicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="search">Buscar Incidente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cliente, placa ou ID do incidente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="investigação">Em Investigação</SelectItem>
                  <SelectItem value="análise">Em Análise</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
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
                  <SelectItem value="roubo">Roubo/Furto</SelectItem>
                  <SelectItem value="acidente">Acidente</SelectItem>
                  <SelectItem value="vandalismo">Vandalismo</SelectItem>
                  <SelectItem value="quebra">Quebra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">Limpar Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Incidentes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Incidentes ({filteredIncidents.length})</CardTitle>
          <CardDescription>Histórico completo de ocorrências</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incidente</TableHead>
                <TableHead>Cliente/Veículo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => {
                const TypeIcon = getTypeIcon(incident.type);
                return (
                  <TableRow key={incident.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{incident.id}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(incident.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{incident.client}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{incident.vehicle}</p>
                        <p className="text-xs font-mono">{incident.plate}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        <span className="text-sm">{incident.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {incident.value > 0 
                          ? incident.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '-'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{incident.agent}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px]">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Incidente {incident.id}</DialogTitle>
                            <DialogDescription>
                              Informações completas da ocorrência
                            </DialogDescription>
                          </DialogHeader>
                          <Tabs defaultValue="details" className="w-full">
                            <TabsList>
                              <TabsTrigger value="details">Detalhes</TabsTrigger>
                              <TabsTrigger value="timeline">Timeline</TabsTrigger>
                              <TabsTrigger value="docs">Documentos</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Cliente</Label>
                                  <p className="text-sm">{incident.client} ({incident.clientId})</p>
                                </div>
                                <div>
                                  <Label>Veículo</Label>
                                  <p className="text-sm">{incident.vehicle} - {incident.plate}</p>
                                </div>
                                <div>
                                  <Label>Tipo de Incidente</Label>
                                  <p className="text-sm">{incident.type}</p>
                                </div>
                                <div>
                                  <Label>Severidade</Label>
                                  <Badge className={getSeverityColor(incident.severity)}>
                                    {incident.severity}
                                  </Badge>
                                </div>
                                <div>
                                  <Label>Local</Label>
                                  <p className="text-sm">{incident.location}</p>
                                </div>
                                <div>
                                  <Label>Data/Hora</Label>
                                  <p className="text-sm">{incident.datetime}</p>
                                </div>
                                <div>
                                  <Label>Reportado por</Label>
                                  <p className="text-sm">{incident.reportedBy}</p>
                                </div>
                                <div>
                                  <Label>Agente Responsável</Label>
                                  <p className="text-sm">{incident.agent}</p>
                                </div>
                              </div>
                              <div>
                                <Label>Descrição</Label>
                                <p className="text-sm mt-1 p-3 bg-muted rounded">{incident.description}</p>
                              </div>
                            </TabsContent>
                            <TabsContent value="timeline" className="space-y-4">
                              <div className="space-y-3">
                                <div className="border-l-2 border-blue-200 pl-4">
                                  <p className="font-medium">Incidente reportado</p>
                                  <p className="text-sm text-muted-foreground">{incident.createdAt}</p>
                                </div>
                                <div className="border-l-2 border-yellow-200 pl-4">
                                  <p className="font-medium">Em análise</p>
                                  <p className="text-sm text-muted-foreground">Aguardando documentação</p>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="docs" className="space-y-4">
                              <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-2" />
                                <p>Nenhum documento anexado</p>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
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