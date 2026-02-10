import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { icon } from "leaflet";
import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { MapPin, Navigation, Search, X } from "lucide-react";
import { Card } from "./card";
import "leaflet/dist/leaflet.css";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [map, setMap] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=5&countrycodes=br&addressdetails=1`
      );
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Erro na busca:", error);
      alert("Erro ao buscar endereço. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onLocationChange(lat, lng);
    setSearchResults([]);
    setSearchTerm("");
    
    // Move the map to the selected location
    if (map) {
      map.setView([lat, lng], 16);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

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
        
        {/* Campo de busca */}
        <div className="relative">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar endereço (ex: Rua Augusta, São Paulo)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 pr-8"
                data-testid="input-search-address"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  data-testid="button-clear-search"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              disabled={!searchTerm.trim() || isSearching}
              size="sm"
              data-testid="button-search"
            >
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          
          {/* Resultados da busca */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelectResult(result)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b last:border-b-0 text-sm"
                  data-testid={`result-${result.place_id}`}
                >
                  <div className="font-medium truncate">{result.display_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          Busque um endereço ou clique no mapa para selecionar a localização
        </div>
        
        <div className="h-64 w-full rounded-lg overflow-hidden border" data-testid="map-container">
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            ref={setMap}
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