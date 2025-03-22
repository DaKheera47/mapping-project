import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type {
  Entity,
  EntityType,
  Relationship,
  RelationshipSet,
  RelationshipType,
} from '@/db/schema';
import { actions } from 'astro:actions';
import React, { useEffect, useMemo, useState } from 'react';

type RelationshipModalContentProps = {
  mode: 'add' | 'edit';
  relationshipSet?: RelationshipSet;
  allRelationships: Relationship[];
  allRelationshipSets: RelationshipSet[];
  allRelationshipTypes: RelationshipType[];
};

const RelationshipModalContent = ({
  mode,
  relationshipSet,
  allRelationships,
  allRelationshipSets,
  allRelationshipTypes,
}: RelationshipModalContentProps) => {
  // Initialize state based on mode and provided relationshipSet
  const [name, setName] = useState(relationshipSet?.name ?? '');
  const [description, setDescription] = useState(
    relationshipSet?.description ?? ''
  );
  const [belongsTo, setBelongsTo] = useState(relationshipSet?.belongsTo ?? '');
  const [whitelist, setWhitelist] = useState<number[]>(
    relationshipSet?.whitelist ?? []
  );
  const [blacklist, setBlacklist] = useState<number[]>(
    relationshipSet?.blacklist ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'whitelist' | 'blacklist'>(
    'whitelist'
  );

  // Group relationships by their type
  const relationshipsByType = useMemo(() => {
    const grouped: {
      [typeId: number]: { typeName: string; relationships: Relationship[] };
    } = {};

    // Initialize groups for all relationship types
    allRelationshipTypes.forEach(type => {
      grouped[type.id] = {
        typeName: type.name || 'Unknown',
        relationships: [],
      };
    });

    // Add relationships to their type groups
    allRelationships.forEach(rel => {
      if (rel.typeId && grouped[rel.typeId]) {
        grouped[rel.typeId].relationships.push(rel);
      }
    });

    // Filter out empty groups
    return Object.fromEntries(
      Object.entries(grouped).filter(
        ([_, group]) => group.relationships.length > 0
      )
    );
  }, [allRelationships, allRelationshipTypes]);

  // Helper function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !belongsTo) {
      setError('Name and Owner fields are required');
      return;
    }

    try {
      if (mode === 'add') {
        const result = await actions.relationshipSets.addRelationshipSet({
          name,
          description,
          belongsTo,
          whitelist,
          blacklist,
        });

        if (result.error) {
          throw new Error(
            result.error.message || 'Failed to create relationship set'
          );
        }
      } else {
        // Edit mode
        if (!relationshipSet) {
          throw new Error('Relationship set not provided for edit mode');
        }

        const result = await actions.relationshipSets.editRelationshipSet({
          id: relationshipSet.id,
          name,
          description,
          belongsTo,
          whitelist,
          blacklist,
        });

        if (result.error) {
          throw new Error(
            result.error.message || 'Failed to update relationship set'
          );
        }
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const toggleRelationshipInWhitelist = (relationshipId: number) => {
    setWhitelist(prev => {
      if (prev.includes(relationshipId)) {
        return prev.filter(id => id !== relationshipId);
      } else {
        return [...prev, relationshipId];
      }
    });
  };

  const toggleRelationshipInBlacklist = (relationshipId: number) => {
    setBlacklist(prev => {
      if (prev.includes(relationshipId)) {
        return prev.filter(id => id !== relationshipId);
      } else {
        return [...prev, relationshipId];
      }
    });
  };

  const formId =
    mode === 'add'
      ? 'add-relationshipset-modal'
      : `edit-relationshipset-modal-${relationshipSet?.id}`;

  return (
    <DialogContent className="sm:max-w-[75vw]">
      <DialogHeader>
        <DialogTitle>
          {mode === 'add' ? 'Add Relationship Set' : 'Edit Relationship Set'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'add'
            ? 'Create a new set of relationships to show or hide on your graph.'
            : 'Update this relationship set to control which relationships appear on your graph.'}{' '}
          Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="rounded-md bg-red-100 p-3 text-red-800">{error}</div>
      )}

      <form id={formId} className="grid gap-4 py-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name*
          </Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="col-span-3"
            placeholder="My Relationship Set"
            required
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="belongsTo" className="text-right">
            Owner*
          </Label>
          <Input
            id="belongsTo"
            value={belongsTo}
            onChange={e => setBelongsTo(e.target.value)}
            className="col-span-3"
            placeholder="user123 or team456"
            required
          />
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="description" className="pt-2 text-right">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="col-span-3 min-h-[80px]"
            placeholder="Describe what this relationship set is for..."
          />
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="mb-4 flex border-b">
            <Button
              variant={activeTab === 'whitelist' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('whitelist')}
              className="rounded-b-none"
            >
              Whitelist
            </Button>
            <Button
              variant={activeTab === 'blacklist' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('blacklist')}
              className="rounded-b-none"
            >
              Blacklist
            </Button>
          </div>

          {activeTab === 'whitelist' ? (
            <div className="max-h-[300px] overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(relationshipsByType).map(group => (
                    <React.Fragment key={`whitelist-group-${group.typeName}`}>
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={3} className="font-medium">
                          {group.typeName}
                        </TableCell>
                      </TableRow>
                      {group.relationships.map(rel => (
                        <TableRow key={`whitelist-rel-${rel.id}`}>
                          <TableCell>
                            <Checkbox
                              checked={whitelist.includes(rel.id)}
                              onCheckedChange={() =>
                                toggleRelationshipInWhitelist(rel.id)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {rel.startEntity?.name} → {rel.endEntity?.name}
                          </TableCell>
                          <TableCell>{rel.type?.name}</TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(relationshipsByType).map(group => (
                    <React.Fragment key={`blacklist-group-${group.typeName}`}>
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={3} className="font-medium">
                          {group.typeName}
                        </TableCell>
                      </TableRow>
                      {group.relationships.map(rel => (
                        <TableRow key={`blacklist-rel-${rel.id}`}>
                          <TableCell>
                            <Checkbox
                              checked={blacklist.includes(rel.id)}
                              onCheckedChange={() =>
                                toggleRelationshipInBlacklist(rel.id)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {rel.startEntity?.name} → {rel.endEntity?.name}
                          </TableCell>
                          <TableCell>{rel.type?.name}</TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="mt-2 text-sm text-gray-500">
            {activeTab === 'whitelist'
              ? 'Select relationships to explicitly include. If empty, all relations are included (unless blacklisted).'
              : 'Select relationships to explicitly exclude from the graph.'}
          </div>
        </div>
      </form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>

        <Button disabled={!name || !belongsTo} form={formId} type="submit">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default RelationshipModalContent;
