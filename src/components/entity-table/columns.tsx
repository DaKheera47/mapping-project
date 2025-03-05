import type { SelectEntity } from '@/db/schema';
import type { ColumnDef } from '@tanstack/react-table';
import RowActions from './RowActions';

export const columns: ColumnDef<SelectEntity>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'location',
    header: 'Location',
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActions entity={row.original} />,
  },
];
