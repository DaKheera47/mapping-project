import { AlertDialog, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Entity, EntityType, Relationship, RelationshipType } from '@/db/schema';
import { MoreHorizontal } from 'lucide-react';
import DeleteModalContent from './modals/DeleteModal';
import AddEditModal from './modals/AddEditModal';

type Props = {
  relationship: Relationship;
  allRelationshipTypes: RelationshipType[];
  allEntities: Entity[];
  allEntityTypes: EntityType[];
};

export default function RowActions({
  relationship,
  allRelationshipTypes,
  allEntities,
  allEntityTypes,
}: Props) {
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
              <DropdownMenuItem>Edit Relationship</DropdownMenuItem>
            </DialogTrigger>

            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive">
                Delete Relationship
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AddEditModal
          mode="edit"
          relationship={relationship}
          allRelationshipTypes={allRelationshipTypes}
          allEntities={allEntities}
          allEntityTypes={allEntityTypes}
        />
        <DeleteModalContent relationship={relationship} />
      </AlertDialog>
    </Dialog>
  );
}
