import { db } from '@/db';
import { EntityType } from '@/db/schema';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'drizzle-orm';

export const entityTypes = {
  getAllEntityTypes: defineAction({
    handler: async () => {
      const entityTypes = await db.query.EntityType.findMany();

      return { entityTypes, serverTime: new Date().toLocaleTimeString() };
    },
  }),
  addEntityType: defineAction({
    input: z.object({
      name: z.string(),
      description: z.string(),
    }),
    handler: async ({ name, description }) => {
      try {
        await db.insert(EntityType).values({ name, description });
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  editEntityType: defineAction({
    input: z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
    }),
    handler: async ({ id, name, description }) => {
      try {
        await db
          .update(EntityType)
          .set({ name, description })
          .where(eq(EntityType.id, id));

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  deleteEntityType: defineAction({
    input: z.object({
      id: z.number(),
    }),
    handler: async ({ id }) => {
      try {
        await db.delete(EntityType).where(eq(EntityType.id, id));
        return { success: true };
      } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
      }
    },
  }),
};
