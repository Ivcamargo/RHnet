import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, useMapEvents, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Target, Search, Loader2 } from "lucide-react";

// Fix Leaflet default icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface GeofencingMapProps {
  latitude: number | null;
  longitude: number | null;
  radius: number;
  onLocationChange: (lat: number, lng: number) => void;
  onRadiusChange: (radius: number) => void;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function GeofencingMap({
  latitude,
  longitude,
  radius,
  onLocationChange,
  onRadiusChange,
}: GeofencingMapProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // Default center (São Paulo, Brasil)
  const defaultCenter: [number, number] = [-23.5505, -46.6333];
  const center: [number, number] = 
    mapCenter ? mapCenter :
    latitude && longitude ? [latitude, longitude] : 
    currentLocation ? [currentLocation.lat, currentLocation.lng] :
    defaultCenter;

  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
          onLocationChange(latitude, longitude);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
          setIsLoadingLocation(false);
        }
      );
    } else {
      alert('Geolocalização não é suportada pelo seu navegador.');
      setIsLoadingLocation(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setCurrentLocation({ lat, lng });
    onLocationChange(lat, lng);
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      alert('Por favor, digite um CEP ou endereço para buscar.');
      return;
    }

    setIsSearching(true);

    try {
      // Try to detect if it's a CEP (Brazilian postal code)
      const cepPattern = /^\d{5}-?\d{3}$/;
      const isCEP = cepPattern.test(searchQuery.replace(/\s/g, ''));

      let searchTerm = searchQuery;
      if (isCEP) {
        // For CEP, add "Brazil" to improve results
        searchTerm = `${searchQuery}, Brasil`;
      } else if (!searchQuery.toLowerCase().includes('brasil') && !searchQuery.toLowerCase().includes('brazil')) {
        // If not a CEP and doesn't mention Brazil, add it
        searchTerm = `${searchQuery}, Brasil`;
      }

      // Use backend geocoding endpoint (proxy for Nominatim)
      const response = await fetch(
        `/api/geocode?query=${encodeURIComponent(searchTerm)}`,
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar localização');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        setCurrentLocation({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        onLocationChange(latitude, longitude);
      } else {
        alert('Localização não encontrada. Tente outro CEP ou endereço.');
      }
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
      alert('Erro ao buscar localização. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="material-shadow">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          Configuração de Cerca Virtual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address/CEP Search */}
        <div className="space-y-2">
          <Label htmlFor="search-address">Buscar Endereço ou CEP</Label>
          <div className="flex gap-2">
            <Input
              id="search-address"
              type="text"
              placeholder="Ex: Av. Paulista, São Paulo ou 01310-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchLocation();
                }
              }}
              className="flex-1"
              data-testid="input-search-address"
            />
            <Button
              type="button"
              onClick={handleSearchLocation}
              disabled={isSearching}
              data-testid="button-search-location"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Digite um endereço ou CEP para localizar no mapa
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="radius">Raio da Cerca (metros)</Label>
            <div className="flex gap-2">
              <Input
                id="radius"
                type="number"
                min="10"
                max="1000"
                step="10"
                value={radius}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                className="flex-1"
                data-testid="input-geofence-radius"
              />
              <span className="text-sm text-gray-500 flex items-center">m</span>
            </div>
            <p className="text-xs text-gray-500">
              Funcionários precisam estar dentro deste raio para bater ponto
            </p>
          </div>

          <div className="space-y-2">
            <Label>Localização Atual</Label>
            <Button
              type="button"
              variant="outline"
              onClick={handleGetCurrentLocation}
              disabled={isLoadingLocation}
              className="w-full"
              data-testid="button-get-current-location"
            >
              <Target className="h-4 w-4 mr-2" />
              {isLoadingLocation ? 'Obtendo...' : 'Usar Minha Localização'}
            </Button>
            <p className="text-xs text-gray-500">
              Ou clique no mapa para selecionar manualmente
            </p>
          </div>
        </div>

        {/* Coordinates Display */}
        {latitude && longitude && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900 mb-1">Coordenadas Selecionadas:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
              <div>
                <span className="font-semibold">Latitude:</span> {latitude.toFixed(6)}
              </div>
              <div>
                <span className="font-semibold">Longitude:</span> {longitude.toFixed(6)}
              </div>
            </div>
          </div>
        )}

        {/* Map */}
        <div className="rounded-lg overflow-hidden border-2 border-gray-200" style={{ height: '400px' }}>
          <MapContainer
            center={center}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapCenterUpdater center={center} />
            <LocationMarker onLocationSelect={handleLocationSelect} />
            
            {latitude && longitude && (
              <>
                <Marker position={[latitude, longitude]} />
                <Circle
                  center={[latitude, longitude]}
                  radius={radius}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.2,
                  }}
                />
              </>
            )}
          </MapContainer>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>💡 Dica:</strong> Clique no mapa para definir o centro da cerca virtual.
            O círculo azul mostra a área permitida para registro de ponto.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
