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
import { useState } from 'react';

const EditModalContent = ({
  relationship,
  allRelationshipTypes,
  allEntities,
}: {
  relationship: Relationship;
  allRelationshipTypes: RelationshipType[];
  allEntities: Entity[];
}) => {
  const [type, setType] = useState(relationship?.type?.name ?? '');
  const [startEntity, setStartEntity] = useState(
    relationship.startEntity.name ?? ''
  );
  const [endEntity, setEndEntity] = useState(relationship.endEntity.name ?? '');
  const [description, setDescription] = useState(
    relationship.description ?? ''
  );

  const handleEdit = async () => {
    try {
      const typeRelationship = allRelationshipTypes.find(
        currentType => currentType.name === type
      );
      const startEntityId = allEntities.find(
        currentEntity => currentEntity.name === startEntity
      );
      const endEntityId = allEntities.find(
        currentEntity => currentEntity.name === endEntity
      );

      if (!typeRelationship || !startEntityId || !endEntityId) {
        throw new Error('Invalid type selected');
      }

      const result = await actions.relationships.editRelationship({
        id: relationship.id,
        description,
        endEntityId: endEntityId.id,
        startEntityId: startEntityId.id,
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
        <DialogTitle>Edit relationship</DialogTitle>
        <DialogDescription>
          Make changes to this relationship here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      <form
        id={`edit-modal-${relationship.id}`}
        className="grid gap-4 py-4"
        onSubmit={handleEdit}
      >
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="entity-start" className="text-right">
            Start Entity
          </Label>

          <Select value={startEntity} onValueChange={setStartEntity}>
            <SelectTrigger className="col-span-3 w-full">
              <SelectValue placeholder="Select a type" />
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
                  onSelect={() => setType(type ?? '')}
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
              <SelectValue placeholder="Select a type" />
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
          form={`edit-modal-${relationship.id}`}
          type="submit"
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditModalContent;
