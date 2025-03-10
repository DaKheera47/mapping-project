import type { Entity, EntityType, Relationship, RelationshipType } from '@/db/schema';
import type { ColumnDef } from '@tanstack/react-table';
import RowActions from './RowActions';

export const getColumns = (
  allRelationshipTypes: RelationshipType[],
  allEntities: Entity[],
  allEntityTypes: EntityType[]
): ColumnDef<Relationship>[] => {
  return [
    {
      accessorKey: 'startEntity.name',
      header: 'Start Entity',
    },
    {
      accessorKey: 'type.name',
      header: 'Relationship Type',
      cell: ({ getValue }) => getValue() || '',
    },
    {
      accessorKey: 'endEntity.name',
      header: 'End Entity',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <RowActions
          relationship={row.original}
          allRelationshipTypes={allRelationshipTypes}
          allEntities={allEntities}
          allEntityTypes={allEntityTypes}
        />
      ),
    },
  ];
};
