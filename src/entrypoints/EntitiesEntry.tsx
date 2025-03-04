import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/components/entity-table/columns';
import { useAction } from '@/hooks/useAction';
import { actions } from 'astro:actions';

export default function IndexEntry() {
  const {
    data: entities,
    error,
    loading,
  } = useAction(actions.entities.getAllEntities);

  return (
    <div className="container mx-auto py-10">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error.message}</div>
      ) : (
        entities && (
          <div className="flex w-full flex-col items-center space-y-4 text-center">
            <span>Last updated: {entities.serverTime}</span>

            <DataTable
              columns={columns}
              data={entities.entities}
              className="w-3/5"
            />
          </div>
        )
      )}
    </div>
  );
}
