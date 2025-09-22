import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  coordinates: [number, number];
  status: 'moving' | 'stopped' | 'offline';
  speed: number;
  lastUpdate: string;
}

const TrackingMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const { toast } = useToast();

  // Carros fake em São Paulo
  const vehicles: Vehicle[] = [
    {
      id: 'V001',
      name: 'Honda Civic',
      plate: 'ABC-1234',
      coordinates: [-46.6333, -23.5505], // Av. Paulista
      status: 'moving',
      speed: 45,
      lastUpdate: '2 min atrás'
    },
    {
      id: 'V002',
      name: 'Toyota Corolla',
      plate: 'DEF-5678',
      coordinates: [-46.6634, -23.5489], // Vila Madalena
      status: 'stopped',
      speed: 0,
      lastUpdate: '5 min atrás'
    },
    {
      id: 'V003',
      name: 'Ford Ka',
      plate: 'GHI-9012',
      coordinates: [-46.6566, -23.5613], // Liberdade
      status: 'moving',
      speed: 32,
      lastUpdate: '1 min atrás'
    },
    {
      id: 'V004',
      name: 'Volkswagen Gol',
      plate: 'JKL-3456',
      coordinates: [-46.6927, -23.5816], // Butantã
      status: 'offline',
      speed: 0,
      lastUpdate: '45 min atrás'
    }
  ];

  const validateAndSetToken = () => {
    if (!mapboxToken.trim()) {
      toast({
        title: "Token necessário",
        description: "Por favor, insira seu token público do Mapbox",
        variant: "destructive"
      });
      return;
    }

    // Validação básica do formato do token
    if (!mapboxToken.startsWith('pk.')) {
      toast({
        title: "Token inválido",
        description: "O token público do Mapbox deve começar com 'pk.'",
        variant: "destructive"
      });
      return;
    }

    setIsTokenValid(true);
    toast({
      title: "Token configurado!",
      description: "Carregando mapa...",
    });
  };

  useEffect(() => {
    if (!isTokenValid || !mapContainer.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-46.6333, -23.5505], // São Paulo center
        zoom: 11,
      });

      // Adicionar controles de navegação
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Aguardar o mapa carregar
      map.current.on('load', () => {
        // Adicionar markers dos veículos
        vehicles.forEach((vehicle) => {
          const el = document.createElement('div');
          el.className = 'vehicle-marker';
          el.style.cssText = `
            width: 32px;
            height: 32px;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${
              vehicle.status === 'moving' 
                ? '%2300d4aa' 
                : vehicle.status === 'stopped' 
                ? '%23f59e0b' 
                : '%23ef4444'
            }"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>');
            background-size: contain;
            background-repeat: no-repeat;
            cursor: pointer;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          `;

          // Popup com informações do veículo
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px; min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${vehicle.name}</h4>
              <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Placa:</strong> ${vehicle.plate}</p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Status:</strong> 
                <span style="color: ${
                  vehicle.status === 'moving' 
                    ? '#10b981' 
                    : vehicle.status === 'stopped' 
                    ? '#f59e0b' 
                    : '#ef4444'
                };">
                  ${vehicle.status === 'moving' ? 'Em movimento' : vehicle.status === 'stopped' ? 'Parado' : 'Offline'}
                </span>
              </p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Velocidade:</strong> ${vehicle.speed} km/h</p>
              <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 12px;">Atualizado ${vehicle.lastUpdate}</p>
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat(vehicle.coordinates)
            .setPopup(popup)
            .addTo(map.current!);
        });
      });

    } catch (error) {
      console.error('Erro ao carregar mapa:', error);
      toast({
        title: "Erro no mapa",
        description: "Verifique se o token do Mapbox está correto",
        variant: "destructive"
      });
      setIsTokenValid(false);
    }

    return () => {
      map.current?.remove();
    };
  }, [isTokenValid, mapboxToken]);

  if (!isTokenValid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurar Mapbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Para exibir o mapa interativo, você precisa configurar seu token público do Mapbox.
            Acesse <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a> e 
            encontre seu token na seção "Tokens" do dashboard.
          </p>
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Token Público do Mapbox</Label>
            <Input
              id="mapbox-token"
              type="password"
              placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJ..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
          </div>
          <Button onClick={validateAndSetToken} className="w-full">
            Configurar Mapa
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status dos veículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{vehicle.name}</p>
                <p className="text-xs text-muted-foreground">{vehicle.plate}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                vehicle.status === 'moving' 
                  ? 'bg-success' 
                  : vehicle.status === 'stopped' 
                  ? 'bg-warning' 
                  : 'bg-destructive'
              }`} />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                {vehicle.speed} km/h • {vehicle.lastUpdate}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Mapa */}
      <Card>
        <CardContent className="p-0">
          <div ref={mapContainer} className="w-full h-96 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingMap;