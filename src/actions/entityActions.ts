import { db } from '@/db';
import { Entity } from '@/db/schema';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'drizzle-orm';

export const entities = {
  getAllEntities: defineAction({
    handler: async () => {
      const entities = await db.query.Entity.findMany({
        with: {
          type: true,
        },
      });

      return { entities, serverTime: new Date().toLocaleTimeString() };
    },
  }),
  addEntity: defineAction({
    input: z.object({
      name: z.string(),
      description: z.string(),
      location: z.string(),
      type: z.number(),
    }),
    handler: async ({ name, description, location }) => {
      try {
        await db.insert(Entity).values({ name, description, location });
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  editEntity: defineAction({
    input: z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      location: z.string(),
      type: z.number(),
    }),
    handler: async ({ id, name, description, location, type }) => {
      try {
        await db
          .update(Entity)
          .set({ name, description, location, typeId: type })
          .where(eq(Entity.id, id));

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
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
