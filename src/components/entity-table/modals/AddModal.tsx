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
import type { EntityType } from '@/db/schema';
import { actions } from 'astro:actions';
import { useState } from 'react';

const AddModalContent = ({
  allEntityTypes,
}: {
  allEntityTypes: EntityType[];
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');

  const handleAdd = async (_e: React.FormEvent<HTMLFormElement>) => {
    try {
      const typeEntity = allEntityTypes.find(
        currentType => currentType.name === type
      );

      if (!typeEntity) {
        throw new Error('Invalid type selected');
      }

      const result = await actions.entities.addEntity({
        name,
        description,
        location,
        type: typeEntity.id,
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
        <DialogTitle>Add new entity</DialogTitle>
        <DialogDescription>
          Provide the details for the new entity. Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      <form
        id="add-modal-form"
        className="grid gap-4 py-4"
        onSubmit={handleAdd}
      >
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="col-span-3"
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
            Type
          </Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="col-span-3 w-full">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>

            <SelectContent className="col-span-3 w-full">
              {allEntityTypes.map(currentType => (
                <SelectItem key={currentType.id} value={currentType.name ?? ''}>
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

        <Button form="add-modal-form" disabled={!name || !type || !description}>
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddModalContent;
