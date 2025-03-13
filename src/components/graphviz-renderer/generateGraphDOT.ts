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
    if (type.id) {
      if (type.dot) {
        // Use dot styling from database
        styleMap[type.id] = type.dot;
      } else {
        // Default styling based on entity type name for backward compatibility
        const typeName = type.name || '';
        let defaultStyle = 'shape=box, color="#d1d5db", style=filled';

        // Create appropriate default styling based on entity type name
        if (typeName === 'Person') {
          defaultStyle =
            'shape=circle, color="yellow", style=filled, fontsize=12';
        } else if (typeName === 'Company') {
          defaultStyle = 'shape=box, color="lightblue", style=filled';
        } else if (
          typeName === 'Government Organisation' ||
          typeName === 'Government Organization'
        ) {
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
    if (type.id) {
      if (type.dot) {
        // Use dot styling from database
        styleMap[type.id] = type.dot;
      } else {
        // Default styling if .dot is not provided
        let defaultStyle = 'color="black"';
        styleMap[type.id] = defaultStyle;
      }
    }
  });

  return styleMap;
};

/**
 * Processes graph elements to create graph layout options
 */
const createGraphLayoutOptions = (
  entities: EnhancedEntity[],
  relationships: EnhancedRelationship[]
): string => {
  // Determine if this is a large graph that needs special handling
  const isLargeGraph = entities.length > 50 || relationships.length > 100;

  // Build layout options string
  let options = '';

  // Add general graph settings
  options += '\tsplines=true;\n';
  options += '\toverlap=false;\n';
  options += '\tnodesep=0.6;\n';

  // Add size-specific settings
  if (isLargeGraph) {
    options += '\tranksep=2.0;\n';
    options += '\tK=1.0;\n'; // Increase spring constant for force-directed layouts
  } else {
    options += '\tranksep=0.8;\n';
  }

  // Add aesthetic settings
  options += '\tbgcolor="transparent";\n';
  options += '\tpad=0.5;\n';

  return options;
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

  // Add graph layout options
  dot += createGraphLayoutOptions(entities, relationships);

  // Define default node styling
  dot +=
    '\tnode [shape=box, style=filled, color="#f3f4f6", fontname="Arial"];\n';

  // Define default edge styling
  dot += '\tedge [fontname="Arial", fontsize=10];\n';

  // Add subgraphs for entities with internal relationships
  Object.keys(internalRelationships).forEach(hostIdStr => {
    const hostId = Number(hostIdStr);
    const host = entityMap[hostId];
    if (!host) return;

    dot += `\tsubgraph cluster${host.id} {\n`;
    dot += `\t\tnode [style=filled, color=white];\n`;
    dot += `\t\tstyle=filled;\n`;
    dot += `\t\tcolor=lightgrey;\n`;
    dot += `\t\tlabel="${host.name || ''}";\n`;
    dot += `\t\tlabeljust=l;\n`; // Left-justify the cluster label
    dot += `\t\tlabelloc=t;\n`; // Place label at top

    // Add all entities that belong to this cluster
    internalRelationships[hostId].forEach(rel => {
      const endEntity = entityMap[rel.endEntityId];
      if (!endEntity) return;

      // Apply specific styling for entities within clusters
      const styling =
        endEntity.type?.id && entityTypeStyleMap[endEntity.type.id]
          ? entityTypeStyleMap[endEntity.type.id]
          : 'shape=box';

      dot += `\t\t${rel.endEntityId} [${styling}, label="${endEntity.name || ''}"];\n`;
    });

    // Add internal relationship connections
    internalRelationships[hostId].forEach(rel => {
      const styling =
        rel.type?.id && relationshipStyleMap[rel.type.id]
          ? `[${relationshipStyleMap[rel.type.id]}]`
          : '';

      dot += `\t\t${rel.startEntityId} -- ${rel.endEntityId} ${styling};\n`;
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
    // (they're already styled within their clusters)
    if (internalRelationships[entity.id]) return;

    // Check if this entity is only an end entity in internal relationships
    const isOnlyInternalEndEntity = Object.values(internalRelationships).some(
      rels => rels.some((rel: Relationship) => rel.endEntityId === entity.id)
    );

    if (isOnlyInternalEndEntity) return;

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
