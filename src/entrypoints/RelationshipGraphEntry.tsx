import GraphVizRenderer from '@/components/graphviz-renderer/renderer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Loading } from '@/components/ui/loading';
import type { RelationshipSet } from '@/db/schema';
import { useAction } from '@/hooks/useAction';
import { actions } from 'astro:actions';
import { ChevronDown, Eye, EyeOff, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {};
export default function RelationshipGraph({}: Props) {
  const [flag, setFlag] = useState(false);
  const [activeRelationshipSetId, setActiveRelationshipSetId] = useState<
    number | null
  >(null);
  const [filteredRelationships, setFilteredRelationships] = useState<any[]>([]);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  // Fetch all data
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
  const {
    data: relationshipSets,
    error: relationshipSetsError,
    loading: relationshipSetsLoading,
  } = useAction(actions.relationshipSets.getAllRelationshipSets, {}, flag);

  const loading =
    relationshipsLoading ||
    entitiesLoading ||
    relationshipTypesLoading ||
    entityTypesLoading ||
    relationshipSetsLoading;

  const error =
    relationshipsError ||
    entitiesError ||
    relationshipTypesError ||
    entityTypesError ||
    relationshipSetsError;

  // Filter relationships based on active relationship set
  useEffect(() => {
    if (!relationships?.relationships) return;

    // If no relationship set is selected, show all
    if (activeRelationshipSetId === null) {
      setFilteredRelationships(relationships.relationships);
      return;
    }

    // Find the active relationship set
    const activeSet = relationshipSets?.relationshipSets?.find(
      (set: RelationshipSet) => set.id === activeRelationshipSetId
    );

    if (!activeSet) {
      setFilteredRelationships(relationships.relationships);
      return;
    }

    // Apply whitelist/blacklist filtering
    const whitelist = activeSet.whitelist || [];
    const blacklist = activeSet.blacklist || [];

    let filtered;

    if (whitelist.length > 0) {
      // If whitelist exists, only show relationships in the whitelist
      filtered = relationships.relationships.filter((rel: any) =>
        whitelist.includes(rel.id)
      );
    } else {
      // If no whitelist, show all except blacklisted
      filtered = relationships.relationships.filter(
        (rel: any) => !blacklist.includes(rel.id)
      );
    }

    setFilteredRelationships(filtered);
  }, [relationships, activeRelationshipSetId, relationshipSets]);

  // Toggle relationship set active status
  const handleRelationshipSetToggle = (setId: number) => {
    if (activeRelationshipSetId === setId) {
      // Deactivate current set
      setActiveRelationshipSetId(null);
    } else {
      // Activate new set
      setActiveRelationshipSetId(setId);
    }
  };

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
            <div className="flex w-full justify-between">
              <div className="flex flex-col">
                <div className="flex items-center space-x-4">
                  <h1 className="text-4xl font-bold">Relationship Graph</h1>
                  <Button variant="outline" onClick={() => setFlag(!flag)}>
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                  {activeRelationshipSetId === null
                    ? 'Showing all relationships'
                    : `Filtering by: ${
                        relationshipSets?.relationshipSets?.find(
                          (s: RelationshipSet) =>
                            s.id === activeRelationshipSetId
                        )?.name || 'Unknown Set'
                      }`}
                </div>
              </div>
            </div>

            {/* Relationship Sets Collapsible */}
            <Collapsible
              className="w-full rounded-lg border"
              open={isCollapsibleOpen}
              onOpenChange={setIsCollapsibleOpen}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                {/* Trigger Button */}
                <div className="flex items-center">
                  <h3 className="text-lg font-medium">Relationship Sets</h3>
                  <Badge variant="outline" className="ml-2">
                    {relationshipSets?.relationshipSets?.length || 0} sets
                  </Badge>
                  {activeRelationshipSetId !== null && (
                    <Badge variant="default" className="ml-2">
                      1 active filter
                    </Badge>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    isCollapsibleOpen ? 'rotate-180' : ''
                  }`}
                />
              </CollapsibleTrigger>

              <CollapsibleContent className="px-4 pb-4">
                <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {relationshipSets?.relationshipSets?.length === 0 ? (
                    <div className="col-span-full p-4 text-center text-gray-500">
                      No relationship sets defined. Create one to help organize
                      your graph.
                    </div>
                  ) : (
                    relationshipSets?.relationshipSets?.map(
                      (set: RelationshipSet) => (
                        <Card
                          key={set.id}
                          className={`overflow-hidden ${
                            activeRelationshipSetId === set.id
                              ? 'ring-primary ring-2'
                              : ''
                          }`}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">
                                {set.name}
                              </CardTitle>
                              <Button
                                variant={
                                  activeRelationshipSetId === set.id
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                  handleRelationshipSetToggle(set.id)
                                }
                                className="h-8"
                              >
                                {activeRelationshipSetId === set.id ? (
                                  <>
                                    <EyeOff className="mr-1 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-1 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </Button>
                            </div>
                            <CardDescription>
                              {set.description || 'No description'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="mt-1 flex gap-2">
                              {(set.whitelist?.length || 0) > 0 && (
                                <Badge
                                  variant="outline"
                                  className="border-green-200 bg-green-50 text-green-700"
                                >
                                  {set.whitelist?.length} whitelisted
                                </Badge>
                              )}
                              {(set.blacklist?.length || 0) > 0 && (
                                <Badge
                                  variant="outline"
                                  className="border-red-200 bg-red-50 text-red-700"
                                >
                                  {set.blacklist?.length} blacklisted
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Graph Stats */}
            <div className="flex w-full justify-between text-sm text-gray-500">
              <span>
                Showing {filteredRelationships.length} of{' '}
                {relationships.relationships.length} relationships
              </span>
            </div>

            {/* Graph Renderer */}
            <GraphVizRenderer
              rerenderFlag={flag}
              entities={entities.entities as any}
              entityTypes={entityTypes.entityTypes as any}
              relationships={filteredRelationships}
              relationshipTypes={relationshipTypes.relationshipTypes as any}
            />
          </>
        )
      )}
    </div>
  );
}
