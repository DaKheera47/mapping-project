import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { entities } from './entityActions';
import { entityTypes } from './entityTypeActions';
import { relationships } from './relationshipActions';
import { relationshipTypes } from './relationshipTypeActions';
import { bulkImport } from './bulkRelationshipImportActions';
import { relationshipSets } from './relationshipSetActions';

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
