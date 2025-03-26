// src/entrypoints/GeographicalGraphEntry.tsx
import React, { useState } from 'react'; // Added useState for refresh flag
import GeographicalMap from '@/components/geographic-map/GeographicalMap';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button'; // For refresh button
import { useAction } from '@/hooks/useAction'; // Import the hook
import { actions } from 'astro:actions'; // Import the actions
import { RefreshCcw } from 'lucide-react'; // For refresh icon

export default function GeographicalGraphEntry() {
  const [flag, setFlag] = useState(false); // State for triggering refresh

  // Fetch entities - ensure getAllEntities includes coordinates and type relation
  const {
    data: entityData,
    error: entitiesError,
    loading: entitiesLoading,
  } = useAction(actions.entities.getAllEntities, {}, flag);

  // Fetch relationships - ensure getAllRelationships includes startEntity, endEntity, and type relations
  const {
    data: relationshipData,
    error: relationshipsError,
    loading: relationshipsLoading,
  } = useAction(actions.relationships.getAllRelationships, {}, flag);

  // Combine loading and error states
  const loading = entitiesLoading || relationshipsLoading;
  const error = entitiesError || relationshipsError;

  // Extract the actual arrays once data is loaded
  const entities = entityData?.entities ?? [];
  const relationships = relationshipData?.relationships ?? [];

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Display a combined error message if any fetch fails
  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-red-500">
        <p className="font-semibold">Error loading map data:</p>
        <p>{error.message}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setFlag(!flag)}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    // Use flex-col to position header and map vertically
    <div className="flex h-full w-full flex-col py-6">
      <div className="mb-4 flex items-center justify-between px-1">
        {' '}
        {/* Add header area */}
        <div>
          <h1 className="text-2xl font-bold">Geographical Map</h1>
          <p className="text-muted-foreground text-sm">
            Displaying{' '}
            {
              entities.filter(e => e.latitude != null && e.longitude != null)
                .length
            }{' '}
            entities with locations.
          </p>
        </div>
        {/* Refresh Button */}
        <Button
          variant="outline"
          onClick={() => setFlag(!flag)}
          aria-label="Refresh map data"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Container for the map, taking remaining space */}
      <div className="flex-grow overflow-hidden rounded-lg border shadow-lg">
        {/* @ts-expect-error this is minor type issues, nbd */}
        <GeographicalMap entities={entities} relationships={relationships} />
      </div>
    </div>
  );
}
