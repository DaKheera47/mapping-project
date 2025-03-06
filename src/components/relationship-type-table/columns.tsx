import type { RelationshipType } from '@/db/schema';
import type { ColumnDef } from '@tanstack/react-table';
import RowActions from './RowActions';

export const getColumns = (): ColumnDef<RelationshipType>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      id: 'actions',
      cell: ({ row }) => <RowActions relationshipType={row.original} />,
    },
  ];
};
