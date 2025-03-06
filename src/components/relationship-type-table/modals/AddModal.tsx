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
import { actions } from 'astro:actions';
import { useState } from 'react';

const AddModalContent = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = async () => {
    try {
      const result = await actions.relationshipTypes.addRelationshipType({
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
        <DialogTitle>Add new relationship type</DialogTitle>
        <DialogDescription>
          Provide the details for the new relationship type. Click save when you're done.
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
      </form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>

        <Button form="add-modal-form" disabled={!name || !description}>
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddModalContent;
