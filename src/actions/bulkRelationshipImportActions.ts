import { db } from '@/db';
import { Entity, Relationship, RelationshipType } from '@/db/schema';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq, and } from 'drizzle-orm';

export const bulkImport = {
  importRelationshipsFromCsv: defineAction({
    input: z.object({
      csvContent: z.string(),
      entityTypeId: z.number(),
    }),
    handler: async ({ csvContent, entityTypeId }) => {
      try {
        if (!csvContent) {
          throw new Error('No CSV content provided');
        }

        if (isNaN(entityTypeId) || entityTypeId <= 0) {
          throw new Error('Invalid entity type ID');
        }

        const records = parseCSV(csvContent);

        if (records.length === 0) {
          throw new Error('CSV content is empty');
        }

        // Track statistics for the import process
        const stats = {
          entitiesCreated: 0,
          relationshipsCreated: 0,
          relationshipTypesCreated: 0,
        };

        // Process each row in the CSV data
        for (const row of records) {
          if (row.length < 3) {
            continue; // Skip rows with fewer than 3 columns
          }

          const startEntityName = row[0].trim();
          const relationshipTypeName = row[1].trim();
          const endEntityName = row[2].trim();

          if (!startEntityName || !relationshipTypeName || !endEntityName) {
            continue; // Skip rows with empty values
          }

          // Skip self-referencing relationships
          if (startEntityName === endEntityName) {
            continue;
          }

          // Find or create the start entity
          let startEntity = await db.query.Entity.findFirst({
            where: eq(Entity.name, startEntityName),
          });

          if (!startEntity) {
            const result = await db
              .insert(Entity)
              .values({
                name: startEntityName,
                typeId: entityTypeId,
                description: '',
                location: '',
              })
              .returning();

            startEntity = result[0];
            stats.entitiesCreated++;
          }

          // Find or create the end entity
          let endEntity = await db.query.Entity.findFirst({
            where: eq(Entity.name, endEntityName),
          });

          if (!endEntity) {
            const result = await db
              .insert(Entity)
              .values({
                name: endEntityName,
                typeId: entityTypeId,
                description: '',
                location: '',
              })
              .returning();

            endEntity = result[0];
            stats.entitiesCreated++;
          }

          // Find or create the relationship type
          let relationshipType = await db.query.RelationshipType.findFirst({
            where: eq(RelationshipType.name, relationshipTypeName),
          });

          if (!relationshipType) {
            const result = await db
              .insert(RelationshipType)
              .values({
                name: relationshipTypeName,
                description: `Auto-created type for ${relationshipTypeName}`,
                dot: '',
              })
              .returning();

            relationshipType = result[0];
            stats.relationshipTypesCreated++;
          }

          // Check if the relationship already exists
          const existingRelationship = await db.query.Relationship.findFirst({
            where: and(
              eq(Relationship.startEntityId, startEntity.id),
              eq(Relationship.endEntityId, endEntity.id),
              eq(Relationship.typeId, relationshipType.id)
            ),
          });

          // Create the relationship if it doesn't exist
          if (!existingRelationship) {
            await db.insert(Relationship).values({
              startEntityId: startEntity.id,
              endEntityId: endEntity.id,
              typeId: relationshipType.id,
              description: row[3] ? row[3].trim() : '', // Use the 4th column as description if available
            });

            stats.relationshipsCreated++;
          }
        }

        return {
          success: true,
          data: stats,
        };
      } catch (error: any) {
        console.error('CSV import error:', error);
        return {
          success: false,
          error: {
            message: error.message || 'An error occurred during import',
          },
        };
      }
    },
  }),
};

// Simple CSV parsing function (no external libraries)
function parseCSV(csvText: string): string[][] {
  // Split by line breaks
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  return lines.map(line => {
    // This is a simple CSV parser and doesn't handle quoted values with commas
    // For a more robust solution, consider a proper CSV parser library
    return line.split(',').map(cell => cell.trim());
  });
}
