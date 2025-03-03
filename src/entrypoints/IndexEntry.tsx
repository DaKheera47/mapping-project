import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/components/user-table/columns';
import { useAction } from '@/hooks/useAction';
import { actions } from 'astro:actions';

export default function IndexEntry() {
  const { data: users, error, loading } = useAction(actions.user.getAllUsers);

  return (
    <div className="container mx-auto py-10">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error.message}</div>
      ) : (
        users && (
          <div className="flex w-full flex-col items-center text-center">
            Last updated: {users.serverTime}
            <DataTable columns={columns} data={users.users} />
          </div>
        )
      )}
    </div>
  );
}
