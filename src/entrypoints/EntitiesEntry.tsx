import { getColumns } from '@/components/entity-table/columns';
import AddModalContent from '@/components/entity-table/modals/AddModal';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DialogTrigger } from '@/components/ui/dialog';
import { useAction } from '@/hooks/useAction';
import { Dialog } from '@radix-ui/react-dialog';
import { actions } from 'astro:actions';
import { PlusIcon, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function IndexEntry() {
  const [flag, setFlag] = useState(false);
  const {
    data: entities,
    error,
    loading,
  } = useAction(actions.entities.getAllEntities, {}, flag);
  const { data: entityTypes } = useAction(
    actions.entityTypes.getAllEntityTypes
  );

  return (
    <div className="container mx-auto py-10">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error.message}</div>
      ) : (
        entities &&
        entityTypes && (
          <div className="flex w-full flex-col items-center space-y-4">
            <div className="flex w-full items-center justify-between">
              <div>
                <div className="flex items-center space-x-4">
                  <h1 className="text-4xl font-bold">Entities</h1>

                  <Dialog>
                    <DialogTrigger>
                      <Button variant="outline">
                        <PlusIcon />
                      </Button>
                    </DialogTrigger>

                    <AddModalContent allEntityTypes={entityTypes.entityTypes} />
                  </Dialog>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {entities.entities.length} entities found
                </div>
              </div>

              <div>
                <span className="font-mono">
                  Last updated: {entities.serverTime}
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
              columns={getColumns(entityTypes.entityTypes)}
              data={entities.entities}
              className="w-full"
            />
          </div>
        )
      )}
    </div>
  );
}
