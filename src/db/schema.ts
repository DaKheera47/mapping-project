import {
  relations,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm';
import {
  boolean,
  date,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  time,
  timestamp,
  uuid,
  varchar,
  numeric,
  jsonb,
} from 'drizzle-orm/pg-core';

export const createTable = pgTableCreator(name => `mapping_proj_${name}`);

// Entity Table
export const Entity = createTable('entity', {
  id: serial('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  location: text('location'),
  typeId: integer('type_id').references(() => EntityType.id),
});

// Entity Type Table
export const EntityType = createTable('entityType', {
  id: serial('id').primaryKey(),
  name: text('name').default('Unknown'),
  description: text('description'),
  dot: text('dot'),
});

// Relationship Type Table
export const RelationshipType = createTable('relationshipType', {
  id: serial('id').primaryKey(),
  name: text('name').default('Unknown'),
  weight: numeric('weight').default('1.0'),
  description: text('description'),
  dot: text('dot'),
});

// Relationship Table
export const Relationship = createTable('relationship', {
  id: serial('id').primaryKey(),
  startEntityId: integer('start_entity_id')
    .notNull()
    .references(() => Entity.id),
  endEntityId: integer('end_entity_id')
    .notNull()
    .references(() => Entity.id),
  typeId: integer('type_id').references(() => RelationshipType.id),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Entity Relations
export const entityRelations = relations(Entity, ({ one, many }) => ({
  type: one(EntityType, {
    fields: [Entity.typeId],
    references: [EntityType.id],
  }),
  startRelationships: many(Relationship, {
    relationName: 'startEntity',
  }),
  endRelationships: many(Relationship, {
    relationName: 'endEntity',
  }),
}));

// Entity Type Relations
export const entityTypeRelations = relations(EntityType, ({ many }) => ({
  entities: many(Entity),
}));

export const RelationshipSet = createTable('relationshipSet', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  belongsTo: text('belongs_to').notNull(), // For user or organization ID
  description: text('description'),
  // Using jsonb arrays to store relationship IDs
  whitelist: jsonb('whitelist').$type<number[]>().default([]),
  blacklist: jsonb('blacklist').$type<number[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relationship Set Relations
export const relationshipSetRelations = relations(
  RelationshipSet,
  ({ many }) => ({
    // This creates a virtual relation to the relationship table
    // It won't be enforced at the database level, but will be useful for querying
    whitelistedRelationships: many(Relationship, {
      relationName: 'whitelistedIn',
    }),
    blacklistedRelationships: many(Relationship, {
      relationName: 'blacklistedIn',
    }),
  })
);

// Relationship Relations
export const relationshipRelations = relations(
  Relationship,
  ({ one, many }) => ({
    startEntity: one(Entity, {
      fields: [Relationship.startEntityId],
      references: [Entity.id],
      relationName: 'startEntity',
    }),
    endEntity: one(Entity, {
      fields: [Relationship.endEntityId],
      references: [Entity.id],
      relationName: 'endEntity',
    }),
    type: one(RelationshipType, {
      fields: [Relationship.typeId],
      references: [RelationshipType.id],
    }),
    whitelistedIn: many(RelationshipSet, {
      relationName: 'whitelistedRelationships',
    }),
    blacklistedIn: many(RelationshipSet, {
      relationName: 'blacklistedRelationships',
    }),
  })
);

// Relationship Type Relations
export const relationshipTypeRelations = relations(
  RelationshipType,
  ({ many }) => ({
    relationships: many(Relationship),
  })
);

// Export types
export type RelationshipType = InferSelectModel<typeof RelationshipType>;
export type EntityType = InferSelectModel<typeof EntityType>;
export type Entity = InferSelectModel<typeof Entity> & {
  type: EntityType;
};
export type Relationship = InferSelectModel<typeof Relationship> & {
  startEntity: Entity;
  endEntity: Entity;
  type: RelationshipType;
};
export type RelationshipSet = InferSelectModel<typeof RelationshipSet>;
