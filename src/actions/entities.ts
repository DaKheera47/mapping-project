import { db } from '@/db';
import { Entity } from '@/db/schema';
import { defineAction } from 'astro:actions';

export const entities = {
  getAllEntities: defineAction({
    handler: async () => {
      const entities = await db.select().from(Entity);
      return { entities, serverTime: new Date().toLocaleTimeString() };
    },
  }),
};
