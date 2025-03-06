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
import type { EntityType } from '@/db/schema';
import { actions } from 'astro:actions';
import { useState } from 'react';

const EditModalContent = ({ entityType }: { entityType: EntityType }) => {
  const [name, setName] = useState(entityType.name ?? '');
  const [description, setDescription] = useState(entityType.description ?? '');

  const handleEdit = async () => {
    try {
      const result = await actions.entityTypes.editEntityType({
        id: entityType.id,
        name,
        description,
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
          Edit entity <span className="italic">{entityType.name}</span>
        </DialogTitle>
        <DialogDescription>
          Make changes to this entity here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      <form
        id={`edit-modal-${entityType.id}`}
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
      </form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>

        <Button
          disabled={!name}
          form={`edit-modal-${entityType.id}`}
          type="submit"
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditModalContent;
