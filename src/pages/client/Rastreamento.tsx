import TrackingMap from '@/components/TrackingMap';

export default function Rastreamento() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rastreamento</h1>
        <p className="text-muted-foreground">
          Monitore seus veículos em tempo real
        </p>
      </div>
      <TrackingMap />
    </div>
  );
}