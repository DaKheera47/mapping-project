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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Entity, Relationship, RelationshipType } from '@/db/schema';
import { actions } from 'astro:actions';
import { useEffect, useState } from 'react';

type RelationshipModalContentProps = {
  mode: 'add' | 'edit';
  relationship?: Relationship;
  allRelationshipTypes: RelationshipType[];
  allEntities: Entity[];
};

const AddEditModal = ({
  mode,
  relationship,
  allRelationshipTypes,
  allEntities,
}: RelationshipModalContentProps) => {
  // Initialize state based on mode and provided relationship
  const [type, setType] = useState(relationship?.type?.name ?? '');
  const [startEntity, setStartEntity] = useState(
    relationship?.startEntity?.name ?? ''
  );
  const [endEntity, setEndEntity] = useState(
    relationship?.endEntity?.name ?? ''
  );
  const [description, setDescription] = useState(
    relationship?.description ?? ''
  );
  const [error, setError] = useState<string | null>(null);

  // Track available end entities
  const [availableEndEntities, setAvailableEndEntities] =
    useState<Entity[]>(allEntities);

  // Update available end entities whenever the start entity changes
  useEffect(() => {
    if (startEntity) {
      const selectedStartEntity = allEntities.find(
        entity => entity.name === startEntity
      );
      if (selectedStartEntity) {
        // Filter out the start entity from available end entities
        setAvailableEndEntities(
          allEntities.filter(entity => entity.id !== selectedStartEntity.id)
        );

        // If current end entity is the same as start entity, clear it
        if (endEntity === startEntity) {
          setEndEntity('');
        }
      }
    } else {
      setAvailableEndEntities(allEntities);
    }
  }, [startEntity, allEntities, endEntity]);

  // Helper function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const typeRelationship = allRelationshipTypes.find(
        currentType => currentType.name === type
      );
      const startEntityRecord = allEntities.find(
        currentEntity => currentEntity.name === startEntity
      );
      const endEntityRecord = allEntities.find(
        currentEntity => currentEntity.name === endEntity
      );

      if (!typeRelationship || !startEntityRecord || !endEntityRecord) {
        throw new Error('Invalid selection');
      }

      // Validate that start and end entities are different
      if (startEntityRecord.id === endEntityRecord.id) {
        setError('Start and end entities must be different');
        return;
      }

      // Handle add or edit based on mode
      if (mode === 'add') {
        const result = await actions.relationships.addRelationship({
          description,
          endEntityId: endEntityRecord.id,
          startEntityId: startEntityRecord.id,
          typeId: typeRelationship.id,
        });

        if (result.error) {
          throw new Error(result.error.message);
        }
      } else {
        // Edit mode
        if (!relationship) {
          throw new Error('Relationship not provided for edit mode');
        }

        const result = await actions.relationships.editRelationship({
          id: relationship.id,
          description,
          endEntityId: endEntityRecord.id,
          startEntityId: startEntityRecord.id,
          typeId: typeRelationship.id,
        });

        if (result.error) {
          throw new Error(result.error.message);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formId =
    mode === 'add'
      ? 'add-relationship-modal'
      : `edit-relationship-modal-${relationship?.id}`;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {mode === 'add' ? 'Add Relationship' : 'Edit Relationship'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'add'
            ? 'Provide the details for your new relationship below.'
            : 'Make changes to this relationship here.'}
          Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="rounded-md bg-red-100 p-3 text-red-800">{error}</div>
      )}

      <form id={formId} className="grid gap-4 py-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="entity-start" className="text-right">
            Start Entity
          </Label>
          <Select value={startEntity} onValueChange={setStartEntity}>
            <SelectTrigger className="col-span-3 w-full">
              <SelectValue placeholder="Select a start entity" />
            </SelectTrigger>
            <SelectContent className="col-span-3 w-full">
              {allEntities.map(currentEntity => (
                <SelectItem
                  key={currentEntity.id}
                  value={currentEntity?.name ?? ''}
                >
                  {currentEntity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">
            Type
          </Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="col-span-3 w-full">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent className="col-span-3 w-full">
              {allRelationshipTypes.map(currentType => (
                <SelectItem
                  key={currentType.id}
                  value={currentType?.name ?? ''}
                >
                  {currentType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="entity-end" className="text-right">
            End Entity
          </Label>
          <Select
            value={endEntity}
            onValueChange={setEndEntity}
            disabled={!startEntity}
          >
            <SelectTrigger className="col-span-3 w-full">
              <SelectValue
                placeholder={
                  !startEntity
                    ? 'Select start entity first'
                    : 'Select an end entity'
                }
              />
            </SelectTrigger>
            <SelectContent className="col-span-3 w-full">
              {availableEndEntities.map(currentEntity => (
                <SelectItem
                  key={currentEntity.id}
                  value={currentEntity?.name ?? ''}
                >
                  {currentEntity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Input
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="col-span-3"
          />
        </div>
      </form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>

        <Button
          disabled={!type || !startEntity || !endEntity}
          form={formId}
          type="submit"
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddEditModal;
