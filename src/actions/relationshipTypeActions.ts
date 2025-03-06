import { db } from '@/db';
import { RelationshipType } from '@/db/schema';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'drizzle-orm';

export const relationshipTypes = {
  getAllRelationshipTypes: defineAction({
    handler: async () => {
      const relationshipTypes = await db.query.RelationshipType.findMany();

      return { relationshipTypes, serverTime: new Date().toLocaleTimeString() };
    },
  }),
  addRelationshipType: defineAction({
    input: z.object({
      name: z.string(),
      description: z.string(),
    }),
    handler: async ({ name, description }) => {
      try {
        await db.insert(RelationshipType).values({ name, description });
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  editRelationshipType: defineAction({
    input: z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
    }),
    handler: async ({ id, name, description }) => {
      try {
        await db
          .update(RelationshipType)
          .set({ name, description })
          .where(eq(RelationshipType.id, id));

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  deleteRelationshipType: defineAction({
    input: z.object({
      id: z.number(),
    }),
    handler: async ({ id }) => {
      try {
        await db.delete(RelationshipType).where(eq(RelationshipType.id, id));
        return { success: true };
      } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
      }
    },
  }),
};
