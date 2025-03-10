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

// Relationship Relations
export const relationshipRelations = relations(Relationship, ({ one }) => ({
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
}));

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
