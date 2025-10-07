import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from "lucide-react";
import TrackingMap from "@/components/TrackingMap";

export default function AdminRastreadores() {
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
      </div>

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
    </div>
  );
}