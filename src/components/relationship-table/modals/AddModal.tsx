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
import type { Entity, RelationshipType } from '@/db/schema';
import { actions } from 'astro:actions';
import { useState } from 'react';

const AddModalContent = ({
  allRelationshipTypes,
  allEntities,
}: {
  allRelationshipTypes: RelationshipType[];
  allEntities: Entity[];
}) => {
  const [type, setType] = useState('');
  const [startEntity, setStartEntity] = useState('');
  const [endEntity, setEndEntity] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = async () => {
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

      const result = await actions.relationships.addRelationship({
        description,
        endEntityId: endEntityRecord.id,
        startEntityId: startEntityRecord.id,
        typeId: typeRelationship.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add Relationship</DialogTitle>
        <DialogDescription>
          Provide the details for your new relationship below. Click save when
          you&apos;re done.
        </DialogDescription>
      </DialogHeader>

      <form id="add-modal" className="grid gap-4 py-4" onSubmit={handleAdd}>
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
                  onSelect={() => setStartEntity(currentEntity?.name ?? '')}
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
                  onSelect={() => setType(currentType?.name ?? '')}
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
          <Select value={endEntity} onValueChange={setEndEntity}>
            <SelectTrigger className="col-span-3 w-full">
              <SelectValue placeholder="Select an end entity" />
            </SelectTrigger>
            <SelectContent className="col-span-3 w-full">
              {allEntities.map(currentEntity => (
                <SelectItem
                  key={currentEntity.id}
                  value={currentEntity?.name ?? ''}
                  onSelect={() => setEndEntity(currentEntity?.name ?? '')}
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
          form="add-modal"
          type="submit"
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddModalContent;
