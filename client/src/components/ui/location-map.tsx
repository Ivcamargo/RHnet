import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { icon } from "leaflet";
import { Button } from "./button";
import { MapPin, Navigation } from "lucide-react";
import { Card } from "./card";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
const defaultIcon = icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationMapProps {
  latitude: number;
  longitude: number;
  radius: number;
  onLocationChange: (lat: number, lng: number) => void;
  className?: string;
}

function LocationPicker({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationMap({ latitude, longitude, radius, onLocationChange, className }: LocationMapProps) {
  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          onLocationChange(lat, lng);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          alert("Não foi possível obter sua localização. Verifique se o GPS está habilitado.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert("Geolocalização não é suportada neste navegador.");
    }
  };

  const center: [number, number] = latitude && longitude ? [latitude, longitude] : [-23.5505, -46.6333]; // Default to São Paulo

  return (
    <Card className={`p-4 ${className || ''}`}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <h3 className="text-lg font-medium">Selecionar Localização</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetCurrentLocation}
            data-testid="button-get-location"
          >
            <Navigation className="h-4 w-4 mr-1" />
            Minha Localização
          </Button>
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          Clique no mapa para selecionar a localização do departamento
        </div>
        
        <div className="h-64 w-full rounded-lg overflow-hidden border" data-testid="map-container">
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationPicker onLocationChange={onLocationChange} />
            {latitude && longitude && (
              <Marker 
                position={[latitude, longitude]} 
                icon={defaultIcon}
              />
            )}
          </MapContainer>
        </div>
        
        {latitude && longitude && (
          <div className="text-xs text-gray-500 flex items-center space-x-4">
            <span data-testid="text-coordinates">
              Coordenadas: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </span>
            <span data-testid="text-radius">
              Raio: {radius}m
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}