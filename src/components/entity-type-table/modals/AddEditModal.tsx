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
import type { EntityType } from '@/db/schema';
import { actions } from 'astro:actions';
import { useState } from 'react';
import DotNodeEditor from './DotNodeEditor';

type EntityTypeModalContentProps = {
  mode: 'add' | 'edit';
  entityType?: EntityType;
};

const EntityTypeModalContent = ({
  mode,
  entityType,
}: EntityTypeModalContentProps) => {
  // Initialize state based on mode
  const [name, setName] = useState(
    mode === 'edit' ? (entityType?.name ?? '') : ''
  );
  const [description, setDescription] = useState(
    mode === 'edit' ? (entityType?.description ?? '') : ''
  );
  const [dot, setDot] = useState(
    mode === 'edit' ? (entityType?.dot ?? '') : ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setError(null);

    try {
      let result;

      if (mode === 'add') {
        result = await actions.entityTypes.addEntityType({
          name,
          description,
          dot, // Include the dot styling
        });
      } else {
        // Edit mode
        if (!entityType) {
          throw new Error('Entity type not provided for edit mode');
        }

        result = await actions.entityTypes.editEntityType({
          id: entityType.id,
          name,
          description,
          dot, // Include the dot styling
        });
      }

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Form ID to link the form and submit button
  const formId =
    mode === 'add'
      ? 'add-entity-type-modal'
      : `edit-entity-type-modal-${entityType?.id}`;

  // Determine dialog width to accommodate the DotEditor
  const dialogWidth = 'sm:max-w-[825px]';

  return (
    <DialogContent className={dialogWidth}>
      <DialogHeader>
        <DialogTitle>
          {mode === 'add' ? (
            'Add new entity type'
          ) : (
            <>
              Edit entity type{' '}
              <span className="italic">{entityType?.name}</span>
            </>
          )}
        </DialogTitle>
        <DialogDescription>
          {mode === 'add'
            ? 'Provide the details for the new entity type.'
            : 'Make changes to this entity type here.'}
          Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-3 text-red-800">
          {error}
        </div>
      )}

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

        <div className="grid grid-cols-1 gap-4">
          <Label htmlFor="dot-editor" className="mb-2">
            Appearance
          </Label>
          <div className="rounded-md border bg-slate-50 p-4">
            <DotNodeEditor
              initialDot={dot}
              onSave={newDot => setDot(newDot)}
              entityTypeName={name || 'Entity Type'}
            />
          </div>
        </div>
      </form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>

        <Button disabled={!name} form={formId} type="submit">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EntityTypeModalContent;
