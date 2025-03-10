import type {
  Entity,
  EntityType,
  Relationship,
  RelationshipType,
} from '@/db/schema';

type EnhancedEntity = Entity & { type: EntityType };
type EnhancedRelationship = Relationship & {
  type: RelationshipType | null;
  startEntity: Entity;
  endEntity: Entity;
};

interface EntityMap {
  [key: number]: EnhancedEntity;
}

interface InternalRelationshipsMap {
  [key: number]: EnhancedRelationship[];
}

interface EntityTypeStyleMap {
  [typeId: number]: string;
}

/**
 * Creates a mapping of entity type IDs to styling strings
 */
const createEntityTypeStyleMap = (
  entityTypes: EntityType[]
): EntityTypeStyleMap => {
  const styleMap: EntityTypeStyleMap = {};
  entityTypes.forEach(type => {
    if (type.id && type.dot) {
      styleMap[type.id] = type.dot;
    } else if (type.id) {
      // Default styling based on entity type name for backward compatibility
      const typeName = type.name || '';
      let defaultStyle = 'shape=box, color="#d1d5db", style=filled';

      if (typeName === 'Person') {
        defaultStyle = 'shape=circle, color="yellow", style=filled, fontsize=8';
      } else if (typeName === 'Company') {
        defaultStyle = 'shape=box, color="lightblue", style=filled';
      } else if (typeName === 'Government Organisation') {
        defaultStyle = 'shape=box, color="lightgreen", style=filled';
      } else if (typeName === 'University') {
        defaultStyle = 'shape=box, color="orange", style=filled';
      } else if (typeName === 'Partnership') {
        defaultStyle = 'shape=ellipse, color="red", style=filled';
      } else if (typeName === 'Collective') {
        defaultStyle = 'shape=ellipse, color="cyan", style=filled';
      } else if (typeName === 'Association') {
        defaultStyle = 'shape=ellipse, color="lightgrey", style=filled';
      } else if (typeName === 'Division') {
        defaultStyle = 'shape=ellipse, color="lightgrey", style=line';
      }

      styleMap[type.id] = defaultStyle;
    }
  });
  return styleMap;
};

/**
 * Creates a mapping of relationship type IDs to styling strings
 */
const createRelationshipTypeStyleMap = (
  relationshipTypes: RelationshipType[]
): { [key: number]: string } => {
  const styleMap: { [key: number]: string } = {};
  relationshipTypes.forEach(type => {
    if (type.id && type.dot) {
      styleMap[type.id] = type.dot;
    } else if (type.id) {
      // Default styling if .dot is not provided
      styleMap[type.id] = 'color=black';
    }
  });
  return styleMap;
};

/**
 * Generates DOT language code for the entity relationship graph
 */
const generateGraphDOT = (
  entities: EnhancedEntity[],
  entityTypes: EntityType[],
  relationships: EnhancedRelationship[],
  relationshipTypes: RelationshipType[]
): string => {
  // Create a map for quick entity lookup
  const entityMap: EntityMap = {};
  entities.forEach(entity => {
    entityMap[entity.id] = entity;
  });

  // Create style maps for both entities and relationships
  const entityTypeStyleMap = createEntityTypeStyleMap(entityTypes);
  const relationshipStyleMap =
    createRelationshipTypeStyleMap(relationshipTypes);

  // Group relationships by parent entity (for subgraphs)
  const internalRelationships: InternalRelationshipsMap = {};
  const externalRelationships: EnhancedRelationship[] = [];

  // Separate division/employee relationships (internal) from others
  relationships.forEach(rel => {
    if (
      rel.type?.name?.includes('Employee') ||
      rel.type?.name?.includes('Division')
    ) {
      if (!internalRelationships[rel.startEntityId]) {
        internalRelationships[rel.startEntityId] = [];
      }
      internalRelationships[rel.startEntityId].push(rel);
    } else {
      externalRelationships.push(rel);
    }
  });

  // Start building the DOT graph
  let dot = 'graph ecosystem {\n';

  // Add subgraphs for entities with internal relationships
  Object.keys(internalRelationships).forEach(hostIdStr => {
    const hostId = Number(hostIdStr);
    const host = entityMap[hostId];
    if (!host) return;

    dot += `\tsubgraph cluster${host.id} {\n`;
    dot += `\t\tnode [style=filled,color=white];\n`;
    dot += `\t\tstyle=filled;\n`;
    dot += `\t\tcolor=lightgrey;\n`;
    dot += `\t\tlabel="${host.name || ''}";\n`;

    internalRelationships[hostId].forEach(rel => {
      dot += `\t\t${rel.endEntityId};\n`;
    });

    dot += '\t};\n';
  });

  // Add external relationships with styling from relationship type
  externalRelationships.forEach(rel => {
    const styling =
      rel.type?.id && relationshipStyleMap[rel.type.id]
        ? `[${relationshipStyleMap[rel.type.id]}]`
        : '';

    dot += `\t${rel.startEntityId} -- ${rel.endEntityId} ${styling};\n`;
  });

  // Style nodes based on entity type
  entities.forEach(entity => {
    // Skip entities that are part of subgraphs with internal relationships
    if (internalRelationships[entity.id]) return;

    // Get entity type styling
    const styling =
      entity.type?.id && entityTypeStyleMap[entity.type.id]
        ? entityTypeStyleMap[entity.type.id]
        : 'shape=box';

    dot += `\t${entity.id} [${styling}, label="${entity.name || ''}"];\n`;
  });

  dot += '}';
  return dot;
};

export default generateGraphDOT;
