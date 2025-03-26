import React, { useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MockEntity {
  id: number;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  type?: { name: string; dot?: string | null };
}

interface MockRelationship {
  id: number;
  startEntityId: number;
  endEntityId: number;
  type?: { name: string; dot?: string | null };
}

interface GeographicalMapProps {
  entities: MockEntity[];
  relationships: MockRelationship[];
}

const GeographicalMap: React.FC<GeographicalMapProps> = ({
  entities = [],
  relationships = [],
}) => {
  const entitiesWithCoords = useMemo(() => {
    return entities.filter(
      e => e.latitude != null && e.longitude != null
    ) as (MockEntity & { latitude: number; longitude: number })[];
  }, [entities]);

  const entityMap = useMemo(() => {
    const map = new Map<
      number,
      MockEntity & { latitude: number; longitude: number }
    >();
    entitiesWithCoords.forEach(e => map.set(e.id, e));
    return map;
  }, [entitiesWithCoords]);

  const polylines = useMemo(() => {
    return relationships
      .map(rel => {
        const startEntity = entityMap.get(rel.startEntityId);
        const endEntity = entityMap.get(rel.endEntityId);

        if (startEntity && endEntity) {
          return {
            id: rel.id,
            positions: [
              [startEntity.latitude, startEntity.longitude] as L.LatLngTuple,
              [endEntity.latitude, endEntity.longitude] as L.LatLngTuple,
            ],
          };
        }
        return null;
      })
      .filter(line => line !== null) as {
      id: number;
      positions: L.LatLngTuple[];
    }[];
  }, [relationships, entityMap]);

  if (entitiesWithCoords.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full w-full items-center justify-center">
        No entities with coordinates to display.
      </div>
    );
  }

  // UK approx center
  const defaultCenter: L.LatLngTuple = [54.5, -3];
  const defaultZoom = 6;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', borderRadius: 'var(--radius)' }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Render Markers */}
      {entitiesWithCoords.map(entity => (
        <Marker key={entity.id} position={[entity.latitude, entity.longitude]}>
          <Popup>
            <b>{entity.name}</b>
          </Popup>
        </Marker>
      ))}

      {/* Render Polylines */}
      {polylines.map(line => (
        <Polyline
          key={line.id}
          positions={line.positions}
          pathOptions={{ color: 'blue', weight: 2 }}
        ></Polyline>
      ))}
    </MapContainer>
  );
};

export default GeographicalMap;
