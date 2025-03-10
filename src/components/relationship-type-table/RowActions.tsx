import { AlertDialog, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { RelationshipType } from '@/db/schema';
import { MoreHorizontal } from 'lucide-react';
import DeleteModalContent from './modals/DeleteModal';
import AddEditModal from './modals/AddEditModal';

type Props = {
  relationshipType: RelationshipType;
};

export default function RowActions({ relationshipType }: Props) {
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
              <DropdownMenuItem>Edit Relationship Type</DropdownMenuItem>
            </DialogTrigger>

            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive">
                Delete Relationship Type
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AddEditModal mode="edit" relationshipType={relationshipType} />
        <DeleteModalContent relationshipType={relationshipType} />
      </AlertDialog>
    </Dialog>
  );
}
