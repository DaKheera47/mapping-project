// src/entrypoints/GeographicalGraphEntry.tsx
import React from 'react';
import GeographicalMap from '@/components/geographic-map/GeographicalMap'; // Adjust path if needed
import { Loading } from '@/components/ui/loading'; // Use existing loading component

// --- MOCK DATA ---
// Replace with actual data fetching (e.g., using useAction) later
const mockEntities = [
  { id: 1, name: 'London Office', latitude: 51.5074, longitude: -0.1278 },
  { id: 2, name: 'Manchester Hub', latitude: 53.4808, longitude: -2.2426 },
  { id: 3, name: 'Bristol Site', latitude: 51.4545, longitude: -2.5879 },
  { id: 4, name: 'Edinburgh HQ', latitude: 55.9533, longitude: -3.1883 },
  { id: 5, name: 'Birmingham Branch', latitude: 52.4862, longitude: -1.8904 },
  { id: 6, name: 'No Coords Entity', latitude: null, longitude: null }, // Entity without coords
  { id: 7, name: 'Cardiff Point', latitude: 51.4816, longitude: -3.1791 },
];

const mockRelationships = [
  { id: 101, startEntityId: 1, endEntityId: 2 }, // London -> Manchester
  { id: 102, startEntityId: 1, endEntityId: 3 }, // London -> Bristol
  { id: 103, startEntityId: 2, endEntityId: 4 }, // Manchester -> Edinburgh
  { id: 104, startEntityId: 5, endEntityId: 1 }, // Birmingham -> London
  { id: 105, startEntityId: 3, endEntityId: 7 }, // Bristol -> Cardiff
  { id: 106, startEntityId: 1, endEntityId: 6 }, // Relationship to entity without coords (won't render line)
  { id: 107, startEntityId: 6, endEntityId: 2 }, // Relationship from entity without coords (won't render line)
];
// --- END MOCK DATA ---

export default function GeographicalGraphEntry() {
  // In the future, replace mock data with fetched data using useAction
  const entities = mockEntities;
  const relationships = mockRelationships;
  const loading = false; // Set to true when fetching real data
  const error = null; // Set error state when fetching real data

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-red-500">
        Error loading data: {/* {error.message} */}
      </div>
    );
  }

  return (
    <div className="h-full w-full py-6">
      {/* Added padding */}
      {/* Container to give the map dimensions */}
      <div className="h-full w-full overflow-hidden rounded-lg border shadow-lg">
        <GeographicalMap entities={entities} relationships={relationships} />
      </div>
    </div>
  );
}
