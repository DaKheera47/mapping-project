import { db } from '@/db';
import { RelationshipSet } from '@/db/schema';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'drizzle-orm';

export const relationshipSets = {
  getAllRelationshipSets: defineAction({
    handler: async () => {
      const relationshipSets = await db.query.RelationshipSet.findMany();
      return { relationshipSets, serverTime: new Date().toLocaleTimeString() };
    },
  }),
  addRelationshipSet: defineAction({
    input: z.object({
      name: z.string(),
      belongsTo: z.string(), // Added belongsTo field
      description: z.string().optional(),
      whitelist: z.array(z.number()).optional().default([]), // Added whitelist field
      blacklist: z.array(z.number()).optional().default([]), // Added blacklist field
    }),
    handler: async ({ name, belongsTo, description, whitelist, blacklist }) => {
      try {
        await db.insert(RelationshipSet).values({
          name,
          belongsTo,
          description,
          whitelist: whitelist || [],
          blacklist: blacklist || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  editRelationshipSet: defineAction({
    input: z.object({
      id: z.number(),
      name: z.string(),
      belongsTo: z.string(), // Added belongsTo field
      description: z.string().optional(),
      whitelist: z.array(z.number()).optional(), // Added whitelist field
      blacklist: z.array(z.number()).optional(), // Added blacklist field
    }),
    handler: async ({
      id,
      name,
      belongsTo,
      description,
      whitelist,
      blacklist,
    }) => {
      try {
        const updateData: any = {
          name,
          belongsTo,
          description,
          updatedAt: new Date(),
        };

        if (whitelist !== undefined) {
          updateData.whitelist = whitelist;
        }

        if (blacklist !== undefined) {
          updateData.blacklist = blacklist;
        }

        await db
          .update(RelationshipSet)
          .set(updateData)
          .where(eq(RelationshipSet.id, id));

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  deleteRelationshipSet: defineAction({
    input: z.object({
      id: z.number(),
    }),
    handler: async ({ id }) => {
      try {
        await db.delete(RelationshipSet).where(eq(RelationshipSet.id, id));
        return { success: true };
      } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
      }
    },
  }),

  // Additional actions for managing whitelist and blacklist
  addToWhitelist: defineAction({
    input: z.object({
      setId: z.number(),
      relationshipId: z.number(),
    }),
    handler: async ({ setId, relationshipId }) => {
      try {
        // First get the current set
        const set = await db.query.RelationshipSet.findFirst({
          where: eq(RelationshipSet.id, setId),
        });

        if (!set) {
          return { success: false, error: 'Relationship set not found' };
        }

        // Add to whitelist if not already present
        const whitelist = [...(set.whitelist || [])];
        if (!whitelist.includes(relationshipId)) {
          whitelist.push(relationshipId);
        }

        // Update the set
        await db
          .update(RelationshipSet)
          .set({
            whitelist,
            updatedAt: new Date(),
          })
          .where(eq(RelationshipSet.id, setId));

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),

  removeFromWhitelist: defineAction({
    input: z.object({
      setId: z.number(),
      relationshipId: z.number(),
    }),
    handler: async ({ setId, relationshipId }) => {
      try {
        // First get the current set
        const set = await db.query.RelationshipSet.findFirst({
          where: eq(RelationshipSet.id, setId),
        });

        if (!set) {
          return { success: false, error: 'Relationship set not found' };
        }

        // Remove from whitelist
        const whitelist = (set.whitelist || []).filter(
          id => id !== relationshipId
        );

        // Update the set
        await db
          .update(RelationshipSet)
          .set({
            whitelist,
            updatedAt: new Date(),
          })
          .where(eq(RelationshipSet.id, setId));

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),

  addToBlacklist: defineAction({
    input: z.object({
      setId: z.number(),
      relationshipId: z.number(),
    }),
    handler: async ({ setId, relationshipId }) => {
      try {
        // First get the current set
        const set = await db.query.RelationshipSet.findFirst({
          where: eq(RelationshipSet.id, setId),
        });

        if (!set) {
          return { success: false, error: 'Relationship set not found' };
        }

        // Add to blacklist if not already present
        const blacklist = [...(set.blacklist || [])];
        if (!blacklist.includes(relationshipId)) {
          blacklist.push(relationshipId);
        }

        // Update the set
        await db
          .update(RelationshipSet)
          .set({
            blacklist,
            updatedAt: new Date(),
          })
          .where(eq(RelationshipSet.id, setId));

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),

  removeFromBlacklist: defineAction({
    input: z.object({
      setId: z.number(),
      relationshipId: z.number(),
    }),
    handler: async ({ setId, relationshipId }) => {
      try {
        // First get the current set
        const set = await db.query.RelationshipSet.findFirst({
          where: eq(RelationshipSet.id, setId),
        });

        if (!set) {
          return { success: false, error: 'Relationship set not found' };
        }

        // Remove from blacklist
        const blacklist = (set.blacklist || []).filter(
          id => id !== relationshipId
        );

        // Update the set
        await db
          .update(RelationshipSet)
          .set({
            blacklist,
            updatedAt: new Date(),
          })
          .where(eq(RelationshipSet.id, setId));

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
};
