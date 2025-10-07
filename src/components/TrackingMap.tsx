import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

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
      return;
    }
    try {
      await loadGoogleMapsScript(googleApiKey);
      setIsApiLoaded(true);
      setIsTokenValid(true);
    } catch (error) {
      console.error('Erro ao carregar Google Maps:', error);
      setIsApiLoaded(false);
      setIsTokenValid(false);
      toast({ title: 'Erro ao carregar Google Maps', description: 'Verifique a VITE_GOOGLE_MAPS_API_KEY', variant: 'destructive' });
    }
  };

  // Carregar automaticamente a API Key do env se existir
  useEffect(() => {
    const envKey = (import.meta as any)?.env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (envKey && !isApiLoaded && !isTokenValid) {
      setGoogleApiKey(envKey);
      // Chama validação após setar a key
      (async () => {
        await new Promise((r) => setTimeout(r, 0));
        validateAndSetToken();
      })();
    }
  }, [isApiLoaded, isTokenValid]);

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
          <CardTitle>Mapa indisponível</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A API key do Google Maps não está configurada. Defina a variável VITE_GOOGLE_MAPS_API_KEY no seu arquivo .env.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mapa apenas */}
      <Card>
        <CardContent className="p-0">
          <div ref={mapContainer} className="w-full h-96 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingMap;