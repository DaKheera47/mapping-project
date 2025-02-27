import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

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
};
