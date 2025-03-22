import { actions } from 'astro:actions';
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
import type { RelationshipSet } from '@/db/schema';
import { useAction } from '@/hooks/useAction';
import { useState } from 'react';
import { Loading } from '@/components/ui/loading';

type Props = {
  relationshipSet: RelationshipSet;
};

export default function DeleteModalContent({ relationshipSet }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await actions.relationshipSets.deleteRelationshipSet({
        id: relationshipSet.id,
      });
      // The modal will close automatically since we're using AlertDialogAction
      // The parent page should refresh data after this
    } catch (error) {
      console.error('Failed to delete relationship set:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete the relationship set "
          {relationshipSet.name}" and remove it from the database. This action
          cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700"
        >
          {isDeleting ? <Loading /> : 'Delete'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
