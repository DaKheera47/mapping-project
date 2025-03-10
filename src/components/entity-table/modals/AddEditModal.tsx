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
import type { Entity, EntityType } from '@/db/schema';
import { actions } from 'astro:actions';
import { useState } from 'react';

type EntityModalContentProps = {
  mode: 'add' | 'edit';
  entity?: Entity;
  allEntityTypes: EntityType[];
};

const EntityModalContent = ({
  mode,
  entity,
  allEntityTypes,
}: EntityModalContentProps) => {
  // Initialize state based on mode
  const [name, setName] = useState(mode === 'edit' ? (entity?.name ?? '') : '');
  const [description, setDescription] = useState(
    mode === 'edit' ? (entity?.description ?? '') : ''
  );
  const [location, setLocation] = useState(
    mode === 'edit' ? (entity?.location ?? '') : ''
  );
  const [type, setType] = useState(
    mode === 'edit' ? (entity?.type?.name ?? '') : ''
  );
  const [error, setError] = useState<string | null>(null);

  // Form ID for reference
  const formId =
    mode === 'add' ? 'add-entity-modal' : `edit-entity-modal-${entity?.id}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const typeEntity = allEntityTypes.find(
        currentType => currentType.name === type
      );

      if (!typeEntity) {
        throw new Error('Invalid type selected');
      }

      let result;

      if (mode === 'add') {
        result = await actions.entities.addEntity({
          name,
          description,
          location,
          type: typeEntity.id,
        });
      } else {
        // Edit mode
        if (!entity) {
          throw new Error('Entity not provided for edit mode');
        }

        result = await actions.entities.editEntity({
          id: entity.id,
          name,
          description,
          location,
          type: typeEntity.id,
        });
      }

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {mode === 'add' ? (
            'Add new entity'
          ) : (
            <>
              Edit entity <span className="italic">{entity?.name}</span>
            </>
          )}
        </DialogTitle>
        <DialogDescription>
          {mode === 'add'
            ? 'Provide the details for the new entity.'
            : 'Make changes to this entity here.'}
          Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-3 text-red-800">
          {error}
        </div>
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
            required
          />
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

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="location" className="text-right">
            Location
          </Label>
          <Input
            id="location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">
            Type*
          </Label>
          <Select value={type} onValueChange={setType} required>
            <SelectTrigger className="col-span-3 w-full">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>

            <SelectContent className="col-span-3 w-full">
              {allEntityTypes.map(currentType => (
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
      </form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>

        <Button disabled={!name || !type} form={formId} type="submit">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EntityModalContent;
