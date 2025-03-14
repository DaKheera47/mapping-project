import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { entities } from './entityActions';
import { entityTypes } from './entityTypeActions';
import { relationships } from './relationshipActions';
import { relationshipTypes } from './relationshipTypeActions';

export const server = {
  getServerTime: defineAction({
    input: z.object({
      name: z.string(),
    }),
    handler: async input => {
      const currentTime = new Date().toLocaleTimeString();
      return `Hello, ${input.name}! The current time is ${currentTime}`;
    },
  }),
  entities,
  entityTypes,
  relationships,
  relationshipTypes,
};
