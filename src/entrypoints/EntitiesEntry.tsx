import { columns } from '@/components/entity-table/columns';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useAction } from '@/hooks/useAction';
import { actions } from 'astro:actions';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function IndexEntry() {
  const [flag, setFlag] = useState(false);
  const {
    data: entities,
    error,
    loading,
  } = useAction(actions.entities.getAllEntities, {}, flag);

  return (
    <div className="container mx-auto py-10">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error.message}</div>
      ) : (
        entities && (
          <div className="flex w-full flex-col items-center space-y-4">
            <div className="flex w-full items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Entities</h1>
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
              columns={columns}
              data={entities.entities}
              className="w-full"
            />
          </div>
        )
      )}
    </div>
  );
}
