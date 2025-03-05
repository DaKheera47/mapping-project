import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SelectEntity } from '@/db/schema';
import { actions } from 'astro:actions';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

type Props = {
  entity: SelectEntity;
};

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

const DeleteModalContent = ({ entity }: { entity: SelectEntity }) => {
  const handleDelete = async () => {
    try {
      const result = await actions.entities.deleteEntity({ id: entity.id });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form id={`delete-modal-${entity.id}`} onSubmit={handleDelete}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete
            <span className="italic"> {entity.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            form={`delete-modal-${entity.id}`}
            variant="destructive"
            type="submit"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </form>
  );
};

export default function RowActions({ entity }: Props) {
  const handleDelete = async () => {
    try {
      const result = await actions.entities.deleteEntity({ id: entity.id });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DialogTrigger asChild>
              <DropdownMenuItem>Edit Entity</DropdownMenuItem>
            </DialogTrigger>

            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive">
                Delete Entity
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <EditModalContent entity={entity} />
        <DeleteModalContent entity={entity} />
      </AlertDialog>
    </Dialog>
  );
}
