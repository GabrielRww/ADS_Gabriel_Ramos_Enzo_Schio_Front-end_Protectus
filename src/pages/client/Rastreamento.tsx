import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { MapPin, Navigation, Shield, Bell, Clock, Car, Route, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TrackingMap from '@/components/TrackingMap';

export default function Rastreamento() {
  const [showMap, setShowMap] = useState(true);
  const { toast } = useToast();


  const veiculos = [
    {
      id: 'TR001',
      nome: 'Honda Civic',
      placa: 'ABC-1234',
      status: 'online',
      localizacao: 'Av. Paulista, 1578 - Bela Vista, São Paulo',
      velocidade: '45 km/h',
      ultimaAtualizacao: '2 minutos atrás'
    }
  ];

  const notificacoes = [
    {
      id: 1,
      tipo: 'movimento',
      mensagem: 'Veículo em movimento detectado',
      timestamp: '14:30',
      data: 'Hoje'
    },
    {
      id: 2,
      tipo: 'parada',
      mensagem: 'Veículo parado há mais de 30 minutos',
      timestamp: '13:45',
      data: 'Hoje'
    },
    {
      id: 3,
      tipo: 'velocidade',
      mensagem: 'Velocidade acima do limite: 85 km/h',
      timestamp: '12:15',
      data: 'Hoje'
    }
  ];

  const historico = [
    {
      data: '12/12/2024',
      horario: '08:30',
      evento: 'Partida',
      local: 'Rua das Flores, 123 - Vila Madalena'
    },
    {
      data: '12/12/2024',
      horario: '09:15',
      evento: 'Parada',
      local: 'Shopping Iguatemi - Av. Brigadeiro Faria Lima'
    },
    {
      data: '12/12/2024',
      horario: '11:30',
      evento: 'Partida',
      local: 'Shopping Iguatemi - Av. Brigadeiro Faria Lima'
    },
    {
      data: '12/12/2024',
      horario: '12:00',
      evento: 'Chegada',
      local: 'Escritório - Av. Paulista, 1578'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-success-light text-success';
      case 'offline':
        return 'bg-destructive-light text-destructive';
      default:
        return 'bg-warning-light text-warning';
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'movimento':
        return <Navigation className="h-4 w-4 text-primary" />;
      case 'parada':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'velocidade':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rastreamento</h1>
        <p className="text-muted-foreground">
          Monitore seus veículos em tempo real
        </p>
      </div>

      <Tabs defaultValue="mapa" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mapa" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Mapa
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mapa" className="space-y-6">
          <TrackingMap />
        </TabsContent>



        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificações Recentes
              </CardTitle>
              <CardDescription>
                Últimos alertas do seu sistema de rastreamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notificacoes.map((notificacao) => (
                  <div key={notificacao.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        {getNotificationIcon(notificacao.tipo)}
                      </div>
                      <div>
                        <p className="font-medium">{notificacao.mensagem}</p>
                        <p className="text-sm text-muted-foreground">Honda Civic - ABC-1234</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{notificacao.timestamp}</p>
                      <p className="text-xs text-muted-foreground">{notificacao.data}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}