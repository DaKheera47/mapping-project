import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { SelectEntity } from '@/db/schema';
import { actions } from 'astro:actions';

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

export default DeleteModalContent;
