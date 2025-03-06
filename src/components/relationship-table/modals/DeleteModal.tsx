import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Relationship } from '@/db/schema';
import { actions } from 'astro:actions';

const DeleteModalContent = ({
  relationship,
}: {
  relationship: Relationship;
}) => {
  const handleDelete = async () => {
    try {
      const result = await actions.relationships.deleteRelationship({
        id: relationship.id,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form id={`delete-modal-${relationship.id}`} onSubmit={handleDelete}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            relationship.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            form={`delete-modal-${relationship.id}`}
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

export default DeleteModalContent;
