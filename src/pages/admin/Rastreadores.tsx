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
import { Switch } from "@/components/ui/switch";
import { Search, MapPin, Power, PowerOff, Eye, Settings, Signal, Battery, Clock, Navigation, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TrackingMap from "@/components/TrackingMap";

export default function AdminRastreadores() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSignal, setFilterSignal] = useState("all");

  const trackers = [
    {
      id: "RT001",
      device: "GPS Tracker Pro",
      client: "João Silva",
      clientId: "C001",
      vehicle: "Honda Civic 2022",
      plate: "ABC-1234",
      status: "Ativo",
      signal: "Forte",
      battery: 85,
      lastUpdate: "2024-01-21 14:30",
      location: "Av. Paulista, 1000 - São Paulo",
      speed: "45 km/h",
      installedAt: "2024-01-15"
    },
    {
      id: "RT002", 
      device: "TrackMax 2000",
      client: "Maria Santos",
      clientId: "C002",
      vehicle: "Toyota Corolla 2021",
      plate: "XYZ-9876",
      status: "Ativo",
      signal: "Médio",
      battery: 62,
      lastUpdate: "2024-01-21 14:25",
      location: "Rua das Flores, 500 - Rio de Janeiro",
      speed: "0 km/h",
      installedAt: "2024-01-10"
    },
    {
      id: "RT003",
      device: "SmartTrack GPS",
      client: "Carlos Ferreira", 
      clientId: "C005",
      vehicle: "Hyundai HB20 2020",
      plate: "DEF-5678",
      status: "Offline",
      signal: "Fraco",
      battery: 15,
      lastUpdate: "2024-01-21 10:15",
      location: "BR-101, Km 45 - Salvador",
      speed: "80 km/h",
      installedAt: "2024-01-12"
    },
    {
      id: "RT004",
      device: "GPS Tracker Pro",
      client: "Ana Costa",
      clientId: "C004", 
      vehicle: "Volkswagen Gol 2019",
      plate: "GHI-9012",
      status: "Ativo",
      signal: "Forte",
      battery: 91,
      lastUpdate: "2024-01-21 14:32",
      location: "Centro, Curitiba - PR",
      speed: "25 km/h",
      installedAt: "2023-12-20"
    },
    {
      id: "RT005",
      device: "TrackMax 2000", 
      client: "Pedro Oliveira",
      clientId: "C003",
      vehicle: "Fiat Uno 2018",
      plate: "JKL-3456",
      status: "Manutenção",
      signal: "Forte",
      battery: 0,
      lastUpdate: "2024-01-20 16:45",
      location: "Oficina Central - Belo Horizonte",
      speed: "0 km/h",
      installedAt: "2024-01-18"
    }
  ];

  const filteredTrackers = trackers.filter(tracker => {
    const matchesSearch = tracker.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tracker.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tracker.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || tracker.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSignal = filterSignal === "all" || tracker.signal.toLowerCase() === filterSignal.toLowerCase();
    return matchesSearch && matchesStatus && matchesSignal;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'manutenção': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal.toLowerCase()) {
      case 'forte': return 'text-green-600';
      case 'médio': return 'text-yellow-600';
      case 'fraco': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return 'text-green-600';
    if (battery > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleToggleTracker = (trackerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Ativo' ? 'Offline' : 'Ativo';
    toast({
      title: "Status alterado!",
      description: `Rastreador ${trackerId} ${newStatus === 'Ativo' ? 'ativado' : 'desativado'}.`,
    });
  };

  const activeCount = trackers.filter(t => t.status === 'Ativo').length;
  const offlineCount = trackers.filter(t => t.status === 'Offline').length;
  const maintenanceCount = trackers.filter(t => t.status === 'Manutenção').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Rastreadores</h1>
          <p className="text-muted-foreground">
            Monitore todos os dispositivos de rastreamento
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            {activeCount} Ativos
          </Badge>
          <Badge variant="outline" className="bg-red-100 text-red-800">
            {offlineCount} Offline
          </Badge>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            {maintenanceCount} Manutenção
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="dispositivos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dispositivos" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Dispositivos
          </TabsTrigger>
          <TabsTrigger value="mapa" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Mapa Geral
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mapa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                Mapa de Todos os Veículos
              </CardTitle>
              <CardDescription>
                Visualize a localização de todos os veículos dos clientes em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrackingMap />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispositivos" className="space-y-6">

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Dispositivos</CardTitle>
            <Navigation className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trackers.length}</div>
            <p className="text-xs text-muted-foreground">
              Dispositivos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos Hoje</CardTitle>
            <Power className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              {((activeCount / trackers.length) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sinal Forte</CardTitle>
            <Signal className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackers.filter(t => t.signal === 'Forte').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Boa qualidade de sinal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bateria Baixa</CardTitle>
            <Battery className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackers.filter(t => t.battery < 20).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Necessitam atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros Avançados</CardTitle>
          <CardDescription>Use os filtros para encontrar dispositivos específicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="search">Buscar Rastreador</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cliente, placa ou ID do dispositivo..."
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
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="manutenção">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signal">Sinal</Label>
              <Select value={filterSignal} onValueChange={setFilterSignal}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="forte">Forte</SelectItem>
                  <SelectItem value="médio">Médio</SelectItem>
                  <SelectItem value="fraco">Fraco</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">Limpar Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Rastreadores */}
      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Ativos ({filteredTrackers.length})</CardTitle>
          <CardDescription>Todos os rastreadores no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Cliente/Veículo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sinal/Bateria</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrackers.map((tracker) => (
                <TableRow key={tracker.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{tracker.id}</p>
                      <p className="text-sm text-muted-foreground">{tracker.device}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{tracker.client}</p>
                      <p className="text-sm text-muted-foreground">{tracker.vehicle}</p>
                      <p className="text-xs font-mono">{tracker.plate}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(tracker.status)}>
                      {tracker.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Signal className={`h-3 w-3 ${getSignalColor(tracker.signal)}`} />
                        <span className="text-sm">{tracker.signal}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Battery className={`h-3 w-3 ${getBatteryColor(tracker.battery)}`} />
                        <span className="text-sm">{tracker.battery}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">{tracker.location}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Velocidade: {tracker.speed}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {tracker.lastUpdate}
                    </div>
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
                            <DialogTitle>Detalhes do Rastreador {tracker.id}</DialogTitle>
                            <DialogDescription>
                              Informações completas do dispositivo
                            </DialogDescription>
                          </DialogHeader>
                          <Tabs defaultValue="info" className="w-full">
                            <TabsList>
                              <TabsTrigger value="info">Informações</TabsTrigger>
                              <TabsTrigger value="location">Localização</TabsTrigger>
                              <TabsTrigger value="settings">Configurações</TabsTrigger>
                            </TabsList>
                            <TabsContent value="info" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Cliente</Label>
                                  <p className="text-sm">{tracker.client} ({tracker.clientId})</p>
                                </div>
                                <div>
                                  <Label>Veículo</Label>
                                  <p className="text-sm">{tracker.vehicle}</p>
                                </div>
                                <div>
                                  <Label>Placa</Label>
                                  <p className="text-sm font-mono">{tracker.plate}</p>
                                </div>
                                <div>
                                  <Label>Dispositivo</Label>
                                  <p className="text-sm">{tracker.device}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <Badge className={getStatusColor(tracker.status)}>
                                    {tracker.status}
                                  </Badge>
                                </div>
                                <div>
                                  <Label>Instalado em</Label>
                                  <p className="text-sm">
                                    {new Date(tracker.installedAt).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="location" className="space-y-4">
                              <div className="space-y-4">
                                <div>
                                  <Label>Localização Atual</Label>
                                  <p className="text-sm">{tracker.location}</p>
                                </div>
                                <div>
                                  <Label>Velocidade</Label>
                                  <p className="text-sm">{tracker.speed}</p>
                                </div>
                                <div>
                                  <Label>Última Atualização</Label>
                                  <p className="text-sm">{tracker.lastUpdate}</p>
                                </div>
                                <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
                                  <p className="text-muted-foreground">Mapa seria exibido aqui</p>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="settings" className="space-y-4">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label>Ativar/Desativar Dispositivo</Label>
                                  <Switch 
                                    checked={tracker.status === 'Ativo'}
                                    onCheckedChange={() => handleToggleTracker(tracker.id, tracker.status)}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label>Notificações em Tempo Real</Label>
                                  <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label>Alerta de Bateria Baixa</Label>
                                  <Switch defaultChecked />
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleToggleTracker(tracker.id, tracker.status)}
                      >
                        {tracker.status === 'Ativo' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}