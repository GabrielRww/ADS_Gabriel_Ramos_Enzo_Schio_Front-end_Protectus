import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getVeiculosPosicoes } from '@/service';
import { useAuthStore } from '@/store/authStore';
import type { VeiculoPosicaoReq, VeiculoPosicaoRes } from '@/service/interface';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type StatusVeiculo = 'em_movimento' | 'parado' | 'offline';

interface VeiculoMapa {
  id: string;
  nome: string;
  placa: string;
  coordenadas: { lat: number; lng: number };
  status: StatusVeiculo;
  velocidade: number;
  atualizadoEmTexto: string;
  rastreadoEm: string;
}

// Tipos mínimos para Google Maps (evita any sem instalar @types/google.maps)
type GLatLngLiteral = { lat: number; lng: number };
interface GMapOptions {
  center: GLatLngLiteral;
  zoom: number;
  mapId?: string;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  mapTypeControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
}
interface GMap {
  fitBounds: (bounds: GLatLngBounds) => void;
}
interface GMarkerIcon {
  path: string;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWeight: number;
  scale: number;
  anchor: unknown;
}
interface GMarkerOptions {
  position: GLatLngLiteral;
  map: GMap;
  icon?: GMarkerIcon;
  title?: string;
}
interface GMarker {
  addListener: (event: 'click', handler: () => void) => void;
  setMap: (map: GMap | null) => void;
}
interface GInfoWindowOptions { content: string }
interface GInfoWindow { open: (map: GMap, marker: GMarker) => void }
interface GLatLngBounds { extend: (pos: GLatLngLiteral) => void }
type GPoint = unknown;
interface GoogleMapsNS {
  Map: new (el: HTMLElement, options: GMapOptions) => GMap;
  Marker: new (options: GMarkerOptions) => GMarker;
  InfoWindow: new (options: GInfoWindowOptions) => GInfoWindow;
  LatLngBounds: new () => GLatLngBounds;
  Point: new (x: number, y: number) => GPoint;
}
declare global {
  interface Window {
    google: { maps: GoogleMapsNS };
    initMap: () => void;
  }
}

const TrackingMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GMap | null>(null);
  const GOOGLE_MAPS_API_KEY = 'AIzaSyBWKr2GGry7vcMR3FvHtK5X2PsDq7x7v9o';
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();
  const markersRef = useRef<GMarker[]>([]);

  // Helper: calcula status a partir dos dados da API
  const computeStatus = (v: VeiculoPosicaoRes): StatusVeiculo => {
    const updatedAt = v.rastreadoEm ? new Date(v.rastreadoEm).getTime() : NaN;
    const tooOld = Number.isFinite(updatedAt) ? (Date.now() - updatedAt) > 30 * 60 * 1000 : true; // > 30 min
    if (!v.rastreadoEm || tooOld) return 'offline';
    const vel = typeof v.velocidade === 'number' ? v.velocidade : 0;
    return vel > 0 ? 'em_movimento' : 'parado';
  };

  // Query: busca posições dos veículos do cliente
  const cpfCliente = useMemo(() => (user?.role === 'cliente' ? String(user.cpf).replace(/\D/g, '') : undefined), [user?.cpf]);
  const { data, isError, error } = useQuery({
    queryKey: ['veiculos-posicoes', cpfCliente],
    queryFn: async () => {
      const payload: VeiculoPosicaoReq = { cpfCliente };
      const res = await getVeiculosPosicoes(payload);
      return res;
    },
    // enabled: Boolean(cpfCliente),
    refetchInterval: 10000,
  });

  // Normaliza resposta (suporta API retornando 1 ou N registros)
  const vehicles: VeiculoMapa[] = useMemo(() => {
    const raw = data as unknown;
    const list: VeiculoPosicaoRes[] = Array.isArray(raw)
      ? (raw as VeiculoPosicaoRes[])
      : raw
        ? [raw as VeiculoPosicaoRes]
        : [];
    return list.map((v, idx) => {
      const status = computeStatus(v);
      const nome = [v.marca, v.modelo, v.ano ? `(${v.ano})` : ''].filter(Boolean).join(' ');
      let atualizadoEmTexto = 'Sem dados';
      if (v.rastreadoEm) {
        try {
          atualizadoEmTexto = formatDistanceToNow(new Date(v.rastreadoEm), { addSuffix: true, locale: ptBR });
        } catch {
          atualizadoEmTexto = 'Atualização inválida';
        }
      }
      return {
        id: v.placa ? `PLACA-${v.placa}` : `IDX-${idx}`,
        nome,
        placa: v.placa || '—',
        coordenadas: { lat: v.latitude, lng: v.longitude },
        status,
        velocidade: typeof v.velocidade === 'number' ? v.velocidade : 0,
        atualizadoEmTexto,
        rastreadoEm: v.rastreadoEm,
      } as VeiculoMapa;
    });
  }, [data]);

  // Notifica erros da consulta
  useEffect(() => {
    if (isError) {
      const message = (error instanceof Error ? error.message : undefined) || 'Tente novamente mais tarde.';
      toast({ title: 'Erro ao buscar posições', description: message, variant: 'destructive' });
    }
  }, [isError, error, toast]);

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

  // Carregar Google Maps automaticamente ao montar o componente
  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
        setIsApiLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar Google Maps:', error);
        toast({
          title: "Erro ao carregar mapa",
          description: "Não foi possível carregar o Google Maps. Verifique sua conexão.",
          variant: "destructive"
        });
      }
    };

    initializeMap();
  }, [toast]);

  const getMarkerColor = (status: StatusVeiculo): string => {
    switch (status) {
      case 'em_movimento':
        return '#00d4aa';
      case 'parado':
        return '#f59e0b';
      case 'offline':
        return '#ef4444';
      default:
        return '#00d4aa';
    }
  };

  const getStatusText = (status: StatusVeiculo): string => {
    switch (status) {
      case 'em_movimento':
        return 'Em movimento';
      case 'parado':
        return 'Parado';
      case 'offline':
        return 'Offline';
      default:
        return status;
    }
  };

  // Inicializa o mapa apenas uma vez
  useEffect(() => {
    if (!isApiLoaded || !mapContainer.current || !window.google) return;
    try {
      const map = new window.google.maps.Map(mapContainer.current, {
        center: { lat: -58.5880664023686, lng: -63.47040526923264 },
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
        title: 'Erro no mapa',
        description: 'Ocorreu um erro ao inicializar o mapa',
        variant: 'destructive',
      });
    }
  }, [isApiLoaded, toast]);

  // Atualiza marcadores sempre que os dados de veículos mudarem
  useEffect(() => {
    if (!isApiLoaded || !window.google || !mapRef.current) return;

    // Limpa marcadores anteriores
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    vehicles.forEach((vehicle) => {
      const markerColor = getMarkerColor(vehicle.status);
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
        position: vehicle.coordenadas,
        map: mapRef.current,
        icon: svgIcon,
        title: vehicle.nome,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
            <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937; font-size: 14px;">${vehicle.nome}</h4>
            <p style="margin: 4px 0; color: #6b7280; font-size: 13px;"><strong>Placa:</strong> ${vehicle.placa}</p>
            <p style="margin: 4px 0; color: #6b7280; font-size: 13px;">
              <strong>Status:</strong>
              <span style="color: ${markerColor}; font-weight: 500;">${getStatusText(vehicle.status)}</span>
            </p>
            <p style="margin: 4px 0; color: #6b7280; font-size: 13px;"><strong>Velocidade:</strong> ${vehicle.velocidade} km/h</p>
            <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 12px;">Atualizado ${vehicle.atualizadoEmTexto}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Ajusta o bounds para contemplar todos os veículos
    if (vehicles.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      vehicles.forEach((v) => bounds.extend(v.coordenadas));
      mapRef.current.fitBounds(bounds);
    }
  }, [vehicles, isApiLoaded]);

  return (
    <div className="space-y-4">
      {/* Status dos veículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{vehicle.nome}</p>
                <p className="text-xs text-muted-foreground">{vehicle.placa}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${vehicle.status === 'em_movimento'
                ? 'bg-success'
                : vehicle.status === 'parado'
                  ? 'bg-warning'
                  : 'bg-destructive'
                }`} />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                {vehicle.velocidade} km/h • {vehicle.atualizadoEmTexto}
              </p>
            </div>
          </Card>
        ))}
      </div>
      {/* Mapa */}
      <Card className="flex-1">
        <CardContent className="p-0">
          <div ref={mapContainer} className="w-full h-[calc(100vh-320px)] min-h-[600px] rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
};


export default TrackingMap;