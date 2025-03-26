import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useMemo } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from 'react-leaflet';

import type { Entity, Relationship, RelationshipType } from '@/db/schema';

interface GeographicalMapProps {
  entities: Entity[];
  relationships: Relationship[];
}

type EntityWithCoords = Entity & { latitude: number; longitude: number };

function hasCoords(
  entity: Entity | undefined | null
): entity is EntityWithCoords {
  if (!entity) return false;
  const lat = entity.latitude != null ? parseFloat(entity.latitude) : NaN;
  const lon = entity.longitude != null ? parseFloat(entity.longitude) : NaN;
  return !isNaN(lat) && !isNaN(lon);
}

const GeographicalMap: React.FC<GeographicalMapProps> = ({
  entities = [],
  relationships = [],
}) => {
  const entitiesWithCoords = useMemo(() => {
    return entities.reduce((acc, e) => {
      const lat = e.latitude != null ? parseFloat(e.latitude) : NaN;
      const lon = e.longitude != null ? parseFloat(e.longitude) : NaN;
      if (!isNaN(lat) && !isNaN(lon)) {
        // @ts-expect-error this is a workaround for the type error
        acc.push({ ...e, latitude: lat, longitude: lon });
      }
      return acc;
    }, [] as EntityWithCoords[]);
  }, [entities]);

  const polylines = useMemo(() => {
    return relationships.reduce(
      (acc, rel) => {
        const startEntity = rel.startEntity;
        const endEntity = rel.endEntity;

        if (hasCoords(startEntity) && hasCoords(endEntity)) {
          acc.push({
            id: rel.id,
            positions: [
              [startEntity.latitude, startEntity.longitude] as L.LatLngTuple,
              [endEntity.latitude, endEntity.longitude] as L.LatLngTuple,
            ],
            type: rel.type,
          });
        }
        return acc;
      },
      [] as {
        id: number;
        positions: L.LatLngTuple[];
        type: RelationshipType | null;
      }[]
    );
  }, [relationships]);

  if (entitiesWithCoords.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full w-full items-center justify-center">
        No entities with coordinates to display.
      </div>
    );
  }

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

      {entitiesWithCoords.map(entity => (
        <Marker key={entity.id} position={[entity.latitude, entity.longitude]}>
          <Popup>
            <b>{entity.name}</b>
            Type: {entity.type?.name || 'N/A'}
            Location: {entity.location?.toUpperCase() || 'N/A'}
          </Popup>
        </Marker>
      ))}

      {polylines.map(line => (
        <Polyline
          key={line.id}
          positions={line.positions}
          pathOptions={{ color: 'blue', weight: 2 }}
        >
          <Popup>Relationship type: {line.type?.name}</Popup>
        </Polyline>
      ))}
    </MapContainer>
  );
};

export default GeographicalMap;
