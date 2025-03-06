import { db } from '@/db';
import { Relationship } from '@/db/schema';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'drizzle-orm';

export const relationships = {
  getAllRelationships: defineAction({
    handler: async () => {
      const relationships = await db.query.Relationship.findMany({
        with: {
          endEntity: true,
          startEntity: true,
          type: true,
        },
      });

      return { relationships, serverTime: new Date().toLocaleTimeString() };
    },
  }),
  addRelationship: defineAction({
    input: z.object({
      startEntityId: z.number(),
      endEntityId: z.number(),
      typeId: z.number(),
      description: z.string(),
    }),
    handler: async ({ startEntityId, endEntityId, typeId, description }) => {
      try {
        await db
          .insert(Relationship)
          .values({ startEntityId, endEntityId, typeId, description });
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  editRelationship: defineAction({
    input: z.object({
      id: z.number(),
      startEntityId: z.number(),
      endEntityId: z.number(),
      typeId: z.number(),
      description: z.string(),
    }),
    handler: async ({
      id,
      startEntityId,
      endEntityId,
      typeId,
      description,
    }) => {
      try {
        await db
          .update(Relationship)
          .set({ startEntityId, endEntityId, typeId, description })
          .where(eq(Relationship.id, id));

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  deleteRelationship: defineAction({
    input: z.object({
      id: z.number(),
    }),
    handler: async ({ id }) => {
      try {
        await db.delete(Relationship).where(eq(Relationship.id, id));
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
};
