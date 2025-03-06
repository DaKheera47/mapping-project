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
import type { RelationshipType } from '@/db/schema';
import { actions } from 'astro:actions';

const DeleteModalContent = ({ relationshipType }: { relationshipType: RelationshipType }) => {
  const handleDelete = async () => {
    try {
      const result = await actions.relationshipTypes.deleteRelationshipType({
        id: relationshipType.id,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form id={`delete-modal-relationship-type-${relationshipType.id}`} onSubmit={handleDelete}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete
            <span className="italic"> {relationshipType.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <Button
            form={`delete-modal-relationship-type-${relationshipType.id}`}
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
