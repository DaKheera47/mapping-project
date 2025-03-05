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
import type { SelectEntity } from '@/db/schema';
import { actions } from 'astro:actions';
import { useState } from 'react';

const EditModalContent = ({ entity }: { entity: SelectEntity }) => {
  const [name, setName] = useState(entity.name ?? '');
  const [description, setDescription] = useState(entity.description ?? '');
  const [location, setLocation] = useState(entity.location ?? '');

  const handleEdit = async () => {
    try {
      const result = await actions.entities.editEntity({
        id: entity.id,
        name,
        description,
        location,
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
        <DialogTitle>
          Edit entity <span className="italic">{entity.name}</span>
        </DialogTitle>
        <DialogDescription>
          Make changes to this entity here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      <form
        id={`edit-modal-${entity.id}`}
        className="grid gap-4 py-4"
        onSubmit={handleEdit}
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
      </form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>

        <Button form={`edit-modal-${entity.id}`} type="submit">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditModalContent;
