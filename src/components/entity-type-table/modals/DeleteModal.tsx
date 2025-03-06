import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { EntityType } from '@/db/schema';
import { actions } from 'astro:actions';

const DeleteModalContent = ({ entityType }: { entityType: EntityType }) => {
  const handleDelete = async () => {
    try {
      const result = await actions.entityTypes.deleteEntityType({
        id: entityType.id,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form id={`delete-modal-entity-type-${entityType.id}`} onSubmit={handleDelete}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete
            <span className="italic"> {entityType.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <Button
            form={`delete-modal-entity-type-${entityType.id}`}
            variant="destructive"
            type="submit"
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </form>
  );
};

export default DeleteModalContent;
