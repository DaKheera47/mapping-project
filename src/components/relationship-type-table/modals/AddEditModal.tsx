// src/components/relationship-type-table/modals/AddEditModal.tsx
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
import DotEditor from './DotEditor'; // Assuming this exists and works for edge styling

type RelationshipTypeModalContentProps = {
  mode: 'add' | 'edit';
  relationshipType?: RelationshipType;
};

const RelationshipTypeModalContent = ({
  mode,
  relationshipType,
}: RelationshipTypeModalContentProps) => {
  // Initialize state based on mode
  const [name, setName] = useState(
    mode === 'edit' ? (relationshipType?.name ?? '') : ''
  );
  const [description, setDescription] = useState(
    mode === 'edit' ? (relationshipType?.description ?? '') : ''
  );
  const [dot, setDot] = useState(
    mode === 'edit' ? (relationshipType?.dot ?? '') : ''
  );
  // Add state for weight, parsing the string from DB to number
  const [weight, setWeight] = useState<number>(
    mode === 'edit'
      ? parseFloat(relationshipType?.weight ?? '1.0') // Parse string to number
      : 1.0
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setError(null);
    setIsSubmitting(true);

    try {
      let result;

      if (mode === 'add') {
        result = await actions.relationshipTypes.addRelationshipType({
          name,
          description,
          dot,
          weight: weight.toString(),
        });
      } else {
        // Edit mode
        if (!relationshipType) {
          throw new Error('Relationship type not provided for edit mode');
        }

        result = await actions.relationshipTypes.editRelationshipType({
          id: relationshipType.id,
          name,
          description,
          dot,
          weight: weight.toString(),
        });
      }

      if (result.error) {
        throw new Error(result.error.message);
      }
      // Close dialog or refresh data - assuming DialogClose handles this or parent needs refresh
      // For simplicity, let's reload the page on success
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form ID to link the form and submit button
  const formId =
    mode === 'add'
      ? 'add-relationship-type-modal'
      : `edit-relationship-type-modal-${relationshipType?.id}`;

  // Determine dialog width to accommodate the DotEditor
  const dialogWidth = 'sm:max-w-[825px]';

  return (
    <DialogContent className={dialogWidth}>
      <DialogHeader>
        <DialogTitle>
          {mode === 'add' ? (
            'Add new relationship type'
          ) : (
            <>
              Edit relationship type{' '}
              <span className="italic">{relationshipType?.name}</span>
            </>
          )}
        </DialogTitle>
        <DialogDescription>
          {mode === 'add'
            ? 'Provide the details for the new relationship type.'
            : 'Make changes to this relationship type here.'}{' '}
          Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-3 text-red-800">
          {error}
        </div>
      )}

      {/* Use onSubmit directly on the form */}
      <form id={formId} className="grid gap-6 py-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name*
          </Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="col-span-3"
            required
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

        {/* Add Input for Weight */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="weight" className="text-right">
            Weight
          </Label>
          <Input
            id="weight"
            type="number" // Use number type input
            value={weight}
            onChange={e => setWeight(parseFloat(e.target.value) || 0)} // Parse input to float
            className="col-span-3"
            step="0.1" // Allow decimal steps
            min="0" // Minimum weight
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Label htmlFor="dot-editor">Appearance (Styling)</Label>
          <div className="rounded-md border bg-slate-50 p-4">
            {/* Assuming DotEditor handles edge styling */}
            <DotEditor initialDot={dot} onSave={newDot => setDot(newDot)} />
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Define visual styles like color and line type. The 'Weight' field
            above influences layout strength.
          </p>
        </div>
      </form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost" disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogClose>

        {/* Button triggers form submission via form ID */}
        <Button disabled={!name || isSubmitting} form={formId} type="submit">
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default RelationshipTypeModalContent;
