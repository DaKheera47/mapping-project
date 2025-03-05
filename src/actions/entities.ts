import { db } from '@/db';
import { Entity } from '@/db/schema';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'drizzle-orm';

export const entities = {
  getAllEntities: defineAction({
    handler: async () => {
      const entities = await db.select().from(Entity);
      return { entities, serverTime: new Date().toLocaleTimeString() };
    },
  }),
  deleteEntity: defineAction({
    input: z.object({
      id: z.number(),
    }),
    handler: async ({ id }) => {
      try {
        await db.delete(Entity).where(eq(Entity.id, id));
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
};
