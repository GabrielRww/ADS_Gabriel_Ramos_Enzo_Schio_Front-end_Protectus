import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  coordinates: { lat: number; lng: number };
  status: 'moving' | 'stopped' | 'offline';
  speed: number;
  lastUpdate: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const TrackingMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const { toast } = useToast();

  // Veículos em São Paulo
  const vehicles: Vehicle[] = [
    {
      id: 'V001',
      name: 'Honda Civic',
      plate: 'ABC-1234',
      coordinates: { lat: -23.5505, lng: -46.6333 }, // Av. Paulista
      status: 'moving',
      speed: 45,
      lastUpdate: '2 min atrás'
    },
    {
      id: 'V002',
      name: 'Toyota Corolla',
      plate: 'DEF-5678',
      coordinates: { lat: -23.5489, lng: -46.6634 }, // Vila Madalena
      status: 'stopped',
      speed: 0,
      lastUpdate: '5 min atrás'
    },
    {
      id: 'V003',
      name: 'Ford Ka',
      plate: 'GHI-9012',
      coordinates: { lat: -23.5613, lng: -46.6566 }, // Liberdade
      status: 'moving',
      speed: 32,
      lastUpdate: '1 min atrás'
    },
    {
      id: 'V004',
      name: 'Volkswagen Gol',
      plate: 'JKL-3456',
      coordinates: { lat: -23.5816, lng: -46.6927 }, // Butantã
      status: 'offline',
      speed: 0,
      lastUpdate: '45 min atrás'
    }
  ];

  const loadGoogleMapsScript = (apiKey: string) => {
    return new Promise((resolve, reject) => {
      // Verificar se já está carregado
      if (window.google && window.google.maps) {
        resolve(window.google);
        return;
      }

      // Remover script anterior se existir
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  };

  const validateAndSetToken = async () => {
    if (!googleApiKey.trim()) {
      toast({
        title: "API Key necessária",
        description: "Por favor, insira sua API Key do Google Maps",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Carregando Google Maps...",
        description: "Aguarde enquanto o mapa é configurado",
      });

      await loadGoogleMapsScript(googleApiKey);
      setIsApiLoaded(true);
      setIsTokenValid(true);
      
      toast({
        title: "Google Maps configurado!",
        description: "O mapa está pronto para uso",
      });
    } catch (error) {
      console.error('Erro ao carregar Google Maps:', error);
      toast({
        title: "Erro ao carregar",
        description: "Verifique se a API Key está correta e tem as permissões necessárias",
        variant: "destructive"
      });
    }
  };

  const getMarkerColor = (status: string): string => {
    switch (status) {
      case 'moving':
        return '#00d4aa';
      case 'stopped':
        return '#f59e0b';
      case 'offline':
        return '#ef4444';
      default:
        return '#00d4aa';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'moving':
        return 'Em movimento';
      case 'stopped':
        return 'Parado';
      case 'offline':
        return 'Offline';
      default:
        return status;
    }
  };

  useEffect(() => {
    if (!isApiLoaded || !isTokenValid || !mapContainer.current || !window.google) return;

    try {
      // Criar o mapa
      const map = new window.google.maps.Map(mapContainer.current, {
        center: { lat: -23.5505, lng: -46.6333 }, // São Paulo center
        zoom: 11,
        mapId: 'DEMO_MAP_ID',
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      mapRef.current = map;

      // Adicionar marcadores dos veículos
      vehicles.forEach((vehicle) => {
        const markerColor = getMarkerColor(vehicle.status);
        
        // Criar ícone SVG para o marcador
        const svgIcon = {
          path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1.5,
          anchor: new window.google.maps.Point(12, 12),
        };

        const marker = new window.google.maps.Marker({
          position: vehicle.coordinates,
          map: map,
          icon: svgIcon,
          title: vehicle.name,
        });

        // Criar InfoWindow
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
              <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937; font-size: 14px;">${vehicle.name}</h4>
              <p style="margin: 4px 0; color: #6b7280; font-size: 13px;"><strong>Placa:</strong> ${vehicle.plate}</p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 13px;">
                <strong>Status:</strong> 
                <span style="color: ${markerColor}; font-weight: 500;">
                  ${getStatusText(vehicle.status)}
                </span>
              </p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 13px;"><strong>Velocidade:</strong> ${vehicle.speed} km/h</p>
              <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 12px;">Atualizado ${vehicle.lastUpdate}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });

    } catch (error) {
      console.error('Erro ao criar mapa:', error);
      toast({
        title: "Erro no mapa",
        description: "Ocorreu um erro ao inicializar o mapa",
        variant: "destructive"
      });
    }
  }, [isApiLoaded, isTokenValid]);

  if (!isTokenValid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurar Google Maps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Para exibir o mapa interativo, você precisa configurar sua API Key do Google Maps.
            Acesse <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a> e 
            ative a Maps JavaScript API para obter sua chave.
          </p>
          <div className="space-y-2">
            <Label htmlFor="google-api-key">API Key do Google Maps</Label>
            <Input
              id="google-api-key"
              type="password"
              placeholder="AIzaSy..."
              value={googleApiKey}
              onChange={(e) => setGoogleApiKey(e.target.value)}
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