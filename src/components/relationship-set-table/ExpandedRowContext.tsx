import type { RelationshipSet, Relationship } from '@/db/schema';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '@/components/ui/badge';

export const ExpandedRowContent = ({
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
          onClick={e => {
            e.stopPropagation();
            setActiveTab('whitelist');
          }}
        >
          Whitelist ({whitelistedRelationships.length})
        </Button>
        <Button
          variant={activeTab === 'blacklist' ? 'default' : 'outline'}
          size="sm"
          onClick={e => {
            e.stopPropagation();
            setActiveTab('blacklist');
          }}
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
                <th className="px-4 py-2 text-left">Relationship (Entity → Entity)</th>
                <th className="px-4 py-2 text-left">Relationship Type</th>
                <th className="px-4 py-2 text-left">Description</th>
              </tr>
            </thead>

            <tbody>
              {displayRelationships.map(rel => (
                <tr key={rel.id} className="border-b">
                  <td className="px-4 py-2">
                    <span>{rel.startEntity?.name}</span>
                    <span className="mx-2">→</span>
                    <span>{rel.endEntity?.name}</span>
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
