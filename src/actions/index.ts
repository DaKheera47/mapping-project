import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { entities } from './entityActions';
import { entityTypes } from './entityTypeActions';

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
};
