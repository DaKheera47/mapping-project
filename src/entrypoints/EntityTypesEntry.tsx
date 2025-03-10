import { getColumns } from '@/components/entity-type-table/columns';
import AddEditModal from '@/components/entity-type-table/modals/AddEditModal';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DialogTrigger } from '@/components/ui/dialog';
import { Loading } from '@/components/ui/loading';
import { useAction } from '@/hooks/useAction';
import { Dialog } from '@radix-ui/react-dialog';
import { actions } from 'astro:actions';
import { PlusIcon, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function EntityTypesEntry() {
  const [flag, setFlag] = useState(false);
  const {
    data: entityTypes,
    error,
    loading,
  } = useAction(actions.entityTypes.getAllEntityTypes, {}, flag);

  return (
    <div className="container mx-auto py-10">
      {loading ? (
        <div className="flex w-full items-center justify-center">
          <Loading />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error.message}</div>
      ) : (
        entityTypes && (
          <div className="flex w-full flex-col items-center space-y-4">
            <div className="flex w-full items-center justify-between">
              <div>
                <div className="flex items-center space-x-4">
                  <h1 className="text-4xl font-bold">Entity Types</h1>

                  <Dialog>
                    <DialogTrigger>
                      <Button variant="outline">
                        <PlusIcon />
                      </Button>
                    </DialogTrigger>

                    <AddEditModal mode="add" />
                  </Dialog>
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                  {entityTypes.entityTypes.length} entity type
                  {entityTypes.entityTypes.length > 1 ? 's' : ''} found
                </div>
              </div>

              <div>
                <span className="font-mono">
                  Last updated: {entityTypes.serverTime}
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
              columns={getColumns()}
              data={entityTypes.entityTypes}
              className="w-full"
            />
          </div>
        )
      )}
    </div>
  );
}
