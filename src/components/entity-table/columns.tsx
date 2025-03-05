import type { Entity, EntityType } from '@/db/schema';
import type { ColumnDef } from '@tanstack/react-table';
import RowActions from './RowActions';

export const getColumns = (
  allEntityTypes: EntityType[]
): ColumnDef<Entity>[] => {
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
      accessorKey: 'location',
      header: 'Location',
    },
    {
      accessorKey: 'type.name',
      header: 'Type',
      cell: ({ getValue }) => getValue() || '',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <RowActions entity={row.original} allEntityTypes={allEntityTypes} />
      ),
    },
  ];
};
