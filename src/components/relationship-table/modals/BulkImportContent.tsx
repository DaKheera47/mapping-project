import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { actions } from 'astro:actions';
import { useState, useRef, useEffect } from 'react';
import { Loader2, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import type { EntityType, RelationshipType } from '@/db/schema';

type BulkImportContentProps = {
  allRelationshipTypes: RelationshipType[];
  allEntityTypes: EntityType[];
};

const BulkImportContent = ({
  allRelationshipTypes,
  allEntityTypes,
}: BulkImportContentProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [importStats, setImportStats] = useState<{
    entitiesCreated: number;
    relationshipsCreated: number;
    relationshipTypesCreated: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedEntityTypeId, setSelectedEntityTypeId] = useState<
    number | null
  >(null);

  // Find default entity type for initial selection (prefer 'Generic' or first in list)
  useEffect(() => {
    if (allEntityTypes.length > 0 && !selectedEntityTypeId) {
      const genericType = allEntityTypes.find(type =>
        type?.name?.toLowerCase().includes('generic')
      );
      setSelectedEntityTypeId(genericType?.id || allEntityTypes[0].id);
    }
  }, [allEntityTypes, selectedEntityTypeId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPreview([]);
    setCsvContent('');
    setImportStats(null);

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (
      selectedFile.type !== 'text/csv' &&
      !selectedFile.name.endsWith('.csv')
    ) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);

    // Read the file contents
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      if (!content) return;

      try {
        // Set the CSV content
        setCsvContent(content);

        // Basic CSV parsing for preview
        const rows = content.split('\n').filter(row => row.trim());
        const parsedRows = rows.map(row =>
          row.split(',').map(cell => cell.trim())
        );

        // Check if CSV has required structure
        if (parsedRows.length === 0) {
          setError('CSV file appears to be empty');
          return;
        }

        // Check if CSV has 3 columns (start entity, relationship type, end entity)
        const hasValidColumns = parsedRows.every(row => row.length >= 3);
        if (!hasValidColumns) {
          setError(
            'CSV must have at least 3 columns: start entity, relationship type, end entity'
          );
          return;
        }

        // Show preview (first 5 rows)
        setPreview(parsedRows.slice(0, 5));
      } catch (err) {
        setError('Failed to parse CSV file');
        console.error(err);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    setError(null);
    setIsUploading(true);

    try {
      if (!file || !csvContent) {
        throw new Error('No file selected or file content is empty');
      }

      if (!selectedEntityTypeId) {
        throw new Error('Please select an entity type for new entities');
      }

      // Call the bulk import action
      const result = await actions.bulkImport.importRelationshipsFromCsv({
        csvContent,
        entityTypeId: selectedEntityTypeId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setImportStats(result.data.data ?? null);
      setFile(null);
      setCsvContent('');
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'An error occurred during import'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Find the selected entity type name for display
  const selectedEntityType = allEntityTypes.find(
    type => type.id === selectedEntityTypeId
  );

  return (
    <DialogContent className="sm:max-w-[750px]">
      <DialogHeader>
        <DialogTitle>Bulk Import Relationships</DialogTitle>
        <DialogDescription>
          Upload a CSV file to import multiple relationships at once. The CSV
          must have at least 3 columns: start entity, relationship type, end
          entity.
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-100 p-3 text-red-800">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {importStats && (
        <div className="flex flex-col gap-2 rounded-md bg-green-100 p-3 text-green-800">
          <div className="flex items-center gap-2">
            <Check size={16} />
            <span>Import successful!</span>
          </div>
          <ul className="mt-1 list-disc pl-6 text-sm">
            <li>{importStats.entitiesCreated} new entities created</li>
            <li>{importStats.relationshipsCreated} relationships created</li>
            <li>
              {importStats.relationshipTypesCreated} new relationship types
              created
            </li>
          </ul>
        </div>
      )}

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="entity-type" className="text-right">
            Entity Type
          </Label>
          <div className="col-span-3">
            <Select
              value={selectedEntityTypeId?.toString() || ''}
              onValueChange={value => setSelectedEntityTypeId(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select entity type for new entities" />
              </SelectTrigger>
              <SelectContent>
                {allEntityTypes.map(entityType => (
                  <SelectItem
                    key={entityType.id}
                    value={entityType.id.toString()}
                  >
                    {entityType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground mt-1 text-xs">
              New entities discovered in the CSV will be created with this type
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="csv-file" className="text-right">
            CSV File
          </Label>
          <div className="col-span-3">
            <input
              ref={fileInputRef}
              type="file"
              id="csv-file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="flex w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              {file ? file.name : 'Select CSV file'}
            </Button>
            <p className="text-muted-foreground mt-1 text-xs">
              CSV should contain: start entity, relationship type, end entity
            </p>
          </div>
        </div>

        {preview.length > 0 && (
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="mt-1 text-right">Preview</Label>
            <div className="col-span-3 overflow-x-auto rounded-md border p-2">
              <div className="mb-2 flex items-center gap-2">
                <FileText size={16} />
                <span className="text-xs font-medium">
                  First {preview.length} rows
                </span>
              </div>

              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border p-1 text-left">Start Entity</th>
                    <th className="border p-1 text-left">Relationship Type</th>
                    <th className="border p-1 text-left">End Entity</th>
                  </tr>
                </thead>

                <tbody>
                  {preview.map((row, index) => (
                    <tr key={index}>
                      <td className="border p-1">{row[0]}</td>
                      <td className="border p-1">{row[1]}</td>
                      <td className="border p-1">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>

        <Button
          onClick={handleImport}
          disabled={!csvContent || isUploading || !selectedEntityTypeId}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            'Import Data'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default BulkImportContent;
