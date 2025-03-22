import type {
  Entity,
  EntityType,
  Relationship,
  RelationshipSet,
  RelationshipType,
} from '@/db/schema';
import type { ColumnDef } from '@tanstack/react-table';
import RowActions from './RowActions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';

export const getColumns = (
  allRelationshipSets: RelationshipSet[],
  allRelationships: Relationship[],
  allRelationshipTypes: RelationshipType[]
): ColumnDef<RelationshipSet>[] => {
  return [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => row.toggleExpanded()}
            aria-label="Toggle Row Expanded"
            className="h-8 w-8 p-0"
          >
            {row.getIsExpanded() ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </Button>
        );
      },
      size: 40,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const relationshipSet = row.original;
        const whitelistCount = relationshipSet.whitelist?.length || 0;
        const blacklistCount = relationshipSet.blacklist?.length || 0;

        return (
          <div>
            <div className="font-medium">{relationshipSet.name}</div>
            <div className="mt-1 flex gap-2">
              {whitelistCount > 0 && (
                <Badge
                  variant="outline"
                  className="border-green-200 bg-green-50 text-green-700"
                >
                  {whitelistCount} whitelisted
                </Badge>
              )}
              {blacklistCount > 0 && (
                <Badge
                  variant="outline"
                  className="border-red-200 bg-red-50 text-red-700"
                >
                  {blacklistCount} blacklisted
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'belongsTo',
      header: 'Owner',
      cell: ({ row }) => {
        const owner = row.original.belongsTo;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {owner.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{owner}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.original.description || '-',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <RowActions
          relationshipSet={row.original}
          allRelationships={allRelationships}
          allRelationshipSets={allRelationshipSets}
          allRelationshipTypes={allRelationshipTypes}
        />
      ),
      size: 60,
    },
  ];
};

// Component for the expanded row content showing whitelisted and blacklisted relationships
export const ExpandedContent = ({
  relationshipSet,
  allRelationships,
}: {
  relationshipSet: RelationshipSet;
  allRelationships: Relationship[];
}) => {
  const [activeTab, setActiveTab] = useState<'whitelist' | 'blacklist'>(
    'whitelist'
  );

  // Get the relationship objects from their IDs
  const whitelistedRelationships = allRelationships.filter(rel =>
    relationshipSet.whitelist?.includes(rel.id)
  );

  const blacklistedRelationships = allRelationships.filter(rel =>
    relationshipSet.blacklist?.includes(rel.id)
  );

  const displayRelationships =
    activeTab === 'whitelist'
      ? whitelistedRelationships
      : blacklistedRelationships;

  const isEmpty = displayRelationships.length === 0;

  return (
    <div className="rounded-md bg-gray-50 p-4">
      <div className="mb-4 flex gap-2">
        <Button
          variant={activeTab === 'whitelist' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('whitelist')}
        >
          Whitelist ({whitelistedRelationships.length})
        </Button>
        <Button
          variant={activeTab === 'blacklist' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('blacklist')}
        >
          Blacklist ({blacklistedRelationships.length})
        </Button>
      </div>

      {isEmpty ? (
        <div className="py-4 text-center text-gray-500">
          {activeTab === 'whitelist'
            ? 'No relationships are explicitly whitelisted. All relationships will be shown unless blacklisted.'
            : 'No relationships are blacklisted.'}
        </div>
      ) : (
        <div className="rounded-md border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Relationship</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {displayRelationships.map(rel => (
                <tr key={rel.id} className="border-b">
                  <td className="px-4 py-2">
                    <span className="font-medium">{rel.startEntity?.name}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium">{rel.endEntity?.name}</span>
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant="outline">
                      {rel.type?.name || 'Unknown'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {rel.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        {activeTab === 'whitelist'
          ? 'Whitelisted relationships are explicitly included in visualizations.'
          : 'Blacklisted relationships are explicitly excluded from visualizations.'}
      </div>
    </div>
  );
};
