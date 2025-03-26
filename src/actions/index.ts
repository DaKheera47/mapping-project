import { z } from 'astro:schema';
import { entities } from './entityActions';
import { defineAction } from 'astro:actions';
import { entityTypes } from './entityTypeActions';
import { relationships } from './relationshipActions';
import { relationshipSets } from './relationshipSetActions';
import { bulkImport } from './bulkRelationshipImportActions';
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
  bulkImport,
  entityTypes,
  relationships,
  relationshipSets,
  relationshipTypes,
};
