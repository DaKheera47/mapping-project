import { getColumns } from '@/components/relationship-set-table/columns';
import { ExpandedRowContent } from '@/components/relationship-set-table/ExpandedRowContext';
import AddEditModal from '@/components/relationship-set-table/modals/AddEditModal';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DialogTrigger } from '@/components/ui/dialog';
import { Loading } from '@/components/ui/loading';
import { useAction } from '@/hooks/useAction';
import { Dialog } from '@radix-ui/react-dialog';
import { actions } from 'astro:actions';
import { PlusIcon, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function RelationshipSetsEntry() {
  const [flag, setFlag] = useState(false);
  const {
    data: relationships,
    error: relationshipsError,
    loading: relationshipsLoading,
  } = useAction(actions.relationships.getAllRelationships, {}, flag);
  const {
    data: relationshipSets,
    error: relationshipSetsError,
    loading: relationshipSetsLoading,
  } = useAction(actions.relationshipSets.getAllRelationshipSets, {}, flag);
  const {
    data: relationshipTypes,
    error: relationshipTypesError,
    loading: relationshipTypesLoading,
  } = useAction(actions.relationshipTypes.getAllRelationshipTypes, {}, flag);

  const loading =
    relationshipsLoading || relationshipSetsLoading || relationshipTypesLoading;
  const error =
    relationshipsError || relationshipSetsError || relationshipTypesError;

  return (
    <div className="container mx-auto py-10">
      {loading ? (
        <div className="flex w-full items-center justify-center">
          <Loading />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error.message}</div>
      ) : (
        relationships &&
        relationshipSets &&
        relationshipTypes && (
          <div className="flex w-full flex-col items-center space-y-4">
            <div className="flex w-full items-center justify-between">
              <div>
                <div className="flex items-center space-x-4">
                  <h1 className="text-4xl font-bold">Relationship Sets</h1>

                  <Dialog>
                    <DialogTrigger>
                      <Button variant="outline">
                        <PlusIcon />
                      </Button>
                    </DialogTrigger>

                    <AddEditModal
                      mode="add"
                      // @ts-expect-error shush
                      allRelationships={relationships.relationships}
                      allRelationshipSets={relationshipSets.relationshipSets}
                      allRelationshipTypes={relationshipTypes.relationshipTypes}
                    />
                  </Dialog>
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                  {relationships.relationships.length}{' '}
                  {relationships.relationships.length > 1
                    ? 'relationship sets'
                    : 'relationship set'}{' '}
                  found
                </div>
              </div>

              <div>
                <span className="font-mono">
                  Last updated: {relationshipSets.serverTime}
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
              columns={getColumns(
                relationshipSets.relationshipSets,
                // @ts-expect-error shush
                relationships.relationships,
                relationshipTypes.relationshipTypes
              )}
              data={relationshipSets.relationshipSets}
              renderSubComponent={({ row }) => (
                <ExpandedRowContent
                  relationshipSet={row}
                  // @ts-expect-error shush
                  allRelationships={relationships.relationships}
                />
              )}
              className="w-full"
            />
          </div>
        )
      )}
    </div>
  );
}
