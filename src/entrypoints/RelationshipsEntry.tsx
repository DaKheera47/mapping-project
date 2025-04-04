import { getColumns } from '@/components/relationship-table/columns';
import AddEditModal from '@/components/relationship-table/modals/AddEditModal';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DialogTrigger } from '@/components/ui/dialog';
import { Loading } from '@/components/ui/loading';
import { useAction } from '@/hooks/useAction';
import { Dialog } from '@radix-ui/react-dialog';
import { actions } from 'astro:actions';
import { FileUpIcon, PlusIcon, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function IndexEntry() {
  const [flag, setFlag] = useState(false);
  const {
    data: relationships,
    error: relationshipsError,
    loading: relationshipsLoading,
  } = useAction(actions.relationships.getAllRelationships, {}, flag);
  const {
    data: allEntities,
    error: entitiesError,
    loading: entitiesLoading,
  } = useAction(actions.entities.getAllEntities, {}, flag);
  const {
    data: relationshipTypes,
    error: relationshipTypesError,
    loading: relationshipTypesLoading,
  } = useAction(actions.relationshipTypes.getAllRelationshipTypes, {}, flag);
  const {
    data: allEntityTypes,
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

  const arePrerequisitesLoaded =
    allEntities && relationships && relationshipTypes && allEntityTypes;

  return (
    <div className="container mx-auto py-10">
      {loading ? (
        <div className="flex w-full items-center justify-center">
          <Loading />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error.message}</div>
      ) : (
        arePrerequisitesLoaded && (
          <div className="flex w-full flex-col items-center space-y-4">
            <div className="flex w-full items-center justify-between">
              <div>
                <div className="flex items-center space-x-4">
                  <h1 className="text-4xl font-bold">Relationships</h1>

                  <Dialog>
                    <DialogTrigger>
                      <Button variant="outline">
                        <PlusIcon />
                      </Button>
                    </DialogTrigger>

                    <AddEditModal
                      mode="add"
                      allRelationshipTypes={relationshipTypes.relationshipTypes}
                      // @ts-ignore idk why this is throwing an error
                      allEntities={allEntities.entities}
                      // @ts-ignore idk why this is throwing an error
                      allEntityTypes={allEntityTypes.entityTypes}
                    />
                  </Dialog>

                  <Dialog>
                    <DialogTrigger>
                      <Button variant="outline">
                        <FileUpIcon />
                      </Button>
                    </DialogTrigger>

                    <AddEditModal
                      mode="bulk-import"
                      allRelationshipTypes={relationshipTypes.relationshipTypes}
                      // @ts-ignore idk why this is throwing an error
                      allEntities={allEntities.entities}
                      // @ts-ignore idk why this is throwing an error
                      allEntityTypes={allEntityTypes.entityTypes}
                    />
                  </Dialog>
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                  {relationships.relationships.length} relationship
                  {relationships.relationships.length > 1 ? 's' : ''} found
                </div>
              </div>

              <div>
                <span className="font-mono">
                  Last updated: {relationships.serverTime}
                </span>
                <Button
                  variant="ghost"
                  className="ml-2"
                  onClick={() => setFlag(!flag)}
                >
                  <RefreshCw />
                </Button>
              </div>
            </div>

            <DataTable
              // @ts-ignore idk why this is throwing an error
              columns={getColumns(
                relationshipTypes.relationshipTypes,
                // @ts-ignore idk why this is throwing an error
                allEntities.entities,
                // @ts-ignore idk why this is throwing an error
                allEntityTypes.entityTypes
              )}
              data={relationships.relationships}
              className="w-full"
            />
          </div>
        )
      )}
    </div>
  );
}
