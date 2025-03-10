import GraphVizRenderer from '@/components/graphviz-renderer/renderer';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { useAction } from '@/hooks/useAction';
import { actions } from 'astro:actions';
import { RotateCw } from 'lucide-react';
import { useState } from 'react';

type Props = {};
export default function RelationshipGraph({}: Props) {
  const [flag, setFlag] = useState(false);
  const {
    data: relationships,
    error: relationshipsError,
    loading: relationshipsLoading,
  } = useAction(actions.relationships.getAllRelationships, {}, flag);
  const {
    data: entities,
    error: entitiesError,
    loading: entitiesLoading,
  } = useAction(actions.entities.getAllEntities, {}, flag);
  const {
    data: relationshipTypes,
    error: relationshipTypesError,
    loading: relationshipTypesLoading,
  } = useAction(actions.relationshipTypes.getAllRelationshipTypes, {}, flag);
  const {
    data: entityTypes,
    error: entityTypesError,
    loading: entityTypesLoading,
  } = useAction(actions.entityTypes.getAllEntityTypes, {}, flag);

  const loading =
    relationshipsLoading ||
    entitiesLoading ||
    relationshipTypesLoading ||
    entityTypesLoading;
  const error =
    relationshipsError ||
    entitiesError ||
    relationshipTypesError ||
    entityTypesError;

  return (
    <div className="container mx-auto flex h-full w-full flex-col items-center space-y-4 py-10">
      {loading ? (
        <div className="flex w-full items-center justify-center">
          <Loading />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error.message}</div>
      ) : (
        relationships &&
        relationships.relationships &&
        entities &&
        entities.entities &&
        relationshipTypes &&
        relationshipTypes.relationshipTypes &&
        entityTypes &&
        entityTypes.entityTypes && (
          <>
            <div className="flex w-full flex-col">
              <div className="flex items-center space-x-4">
                <h1 className="text-4xl font-bold">Relationship Graph</h1>
                <Button variant="outline" onClick={() => setFlag(!flag)}>
                  <RotateCw />
                </Button>
              </div>
              <div className="mt-1 text-sm text-neutral-500">
                A graph of the relationships between different entities
              </div>
            </div>

            <GraphVizRenderer
              rerenderFlag={flag}
              entities={entities.entities as any}
              entityTypes={entityTypes.entityTypes as any}
              relationships={relationships.relationships as any}
              relationshipTypes={relationshipTypes.relationshipTypes as any}
            />
          </>
        )
      )}
    </div>
  );
}
