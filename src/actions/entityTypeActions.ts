import { db } from '@/db';
import { defineAction } from 'astro:actions';

export const entityTypes = {
  getAllEntityTypes: defineAction({
    handler: async () => {
      const entityTypes = await db.query.EntityType.findMany();

      return { entityTypes, serverTime: new Date().toLocaleTimeString() };
    },
  }),
};
