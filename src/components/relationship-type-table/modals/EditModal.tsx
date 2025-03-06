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
import type { RelationshipType } from '@/db/schema';
import { actions } from 'astro:actions';
import { useState } from 'react';

const EditModalContent = ({ relationshipType }: { relationshipType: RelationshipType }) => {
  const [name, setName] = useState(relationshipType.name ?? '');
  const [description, setDescription] = useState(relationshipType.description ?? '');

  const handleEdit = async () => {
    try {
      const result = await actions.relationshipTypes.editRelationshipType({
        id: relationshipType.id,
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
          Edit relationship <span className="italic">{relationshipType.name}</span>
        </DialogTitle>
        <DialogDescription>
          Make changes to this relationship here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      <form
        id={`edit-modal-${relationshipType.id}`}
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
          disabled={!name || !description}
          form={`edit-modal-${relationshipType.id}`}
          type="submit"
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditModalContent;
