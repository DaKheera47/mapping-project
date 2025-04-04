import type {
  Entity,
  EntityType,
  Relationship,
  RelationshipType,
} from '@/db/schema';

// --- Type Definitions ---

// Enhanced types add resolved related data (like the full EntityType object)
// or associated objects needed for processing (like start/end entities for relationships)
type EnhancedEntity = Entity & { type: EntityType };
type EnhancedRelationship = Relationship & {
  type: RelationshipType | null; // Relationship type might be null
  startEntity: Entity;
  endEntity: Entity;
};

// Map for quick entity lookup by ID
interface EntityMap {
  [key: number]: EnhancedEntity;
}

// Map for entity type ID to its DOT styling string
interface EntityTypeStyleMap {
  [typeId: number]: string;
}

// Map for relationship type ID to its DOT styling string
interface RelationshipTypeStyleMap {
  [typeId: number]: string;
}

// --- Styling Map Creation Functions ---

/**
 * Creates a mapping of entity type IDs to DOT styling strings.
 * Prioritizes styling defined in the database (`type.dot`).
 * Falls back to default styles based on type name if `type.dot` is missing.
 */
const createEntityTypeStyleMap = (
  entityTypes: EntityType[]
): EntityTypeStyleMap => {
  const styleMap: EntityTypeStyleMap = {};

  entityTypes.forEach(type => {
    // Ensure type and type.id exist
    if (type?.id) {
      if (type.dot) {
        // Use specific styling from the database if available
        styleMap[type.id] = type.dot;
      } else {
        // Fallback to default styling based on entity type name
        const typeName = type.name || '';
        let defaultStyle = 'shape=box, color="#d1d5db", style=filled'; // Default grey box

        // Assign specific default styles based on common entity type names
        switch (typeName) {
          case 'Person':
            defaultStyle = 'shape=circle, color="yellow", style=filled, fontsize=12';
            break;
          case 'Company':
            defaultStyle = 'shape=box, color="lightblue", style=filled';
            break;
          case 'Government Organisation': // Spelling variations
          case 'Government Organization':
            defaultStyle = 'shape=box, color="lightgreen", style=filled';
            break;
          case 'University':
            defaultStyle = 'shape=box, color="orange", style=filled';
            break;
          case 'Partnership':
            defaultStyle = 'shape=ellipse, color="red", style=filled';
            break;
          case 'Collective':
            defaultStyle = 'shape=ellipse, color="cyan", style=filled';
            break;
          case 'Association':
            defaultStyle = 'shape=ellipse, color="lightgrey", style=filled';
            break;
          case 'Division':
            // Example: Division might be styled differently (e.g., less prominent)
            defaultStyle = 'shape=ellipse, color="#e5e7eb", style=filled'; // Lighter grey ellipse
            break;
          // Add more default cases as needed
        }
        styleMap[type.id] = defaultStyle;
      }
    }
  });

  return styleMap;
};

/**
 * Creates a mapping of relationship type IDs to DOT styling strings.
 * Prioritizes styling defined in the database (`type.dot`).
 * Falls back to a default style if `type.dot` is missing.
 */
const createRelationshipTypeStyleMap = (
  relationshipTypes: RelationshipType[]
): RelationshipTypeStyleMap => {
  const styleMap: RelationshipTypeStyleMap = {};

  relationshipTypes.forEach(type => {
    // Ensure type and type.id exist
    if (type?.id) {
      if (type.dot) {
        // Use specific styling from the database if available
        styleMap[type.id] = type.dot;
      } else {
        // Fallback to a simple default style
        // You could add more sophisticated defaults based on type.name here if needed
        styleMap[type.id] = 'color="black"'; // Default black line
      }
    }
  });

  return styleMap;
};


// --- Graph Layout Options ---

/**
 * Generates DOT graph layout option strings based on graph size.
 * Adjusts parameters like node separation and spring constant for better layout.
 */
const createGraphLayoutOptions = (
  entities: EnhancedEntity[],
  relationships: EnhancedRelationship[]
): string => {
  // Heuristic to determine if the graph is "large"
  const isLargeGraph = entities.length > 50 || relationships.length > 100;

  // Build layout options string line by line for clarity
  let options = '';
  options += '\t// Graph layout options\n';
  options += '\tsplines=true; // Use curved edges\n';
  options += '\toverlap=false; // Try to prevent node overlap (can use "scale" or "prism")\n';
  options += '\tnodesep=0.6; // Minimum space between nodes\n';
  options += '\tbgcolor="transparent"; // Transparent background\n';
  options += '\tpad=0.5; // Padding around the graph\n';


  // Add size-specific layout adjustments
  if (isLargeGraph) {
    options += '\t// Settings for large graphs\n';
    options += '\tranksep=2.0; // Increase vertical separation between ranks\n';
    // K is relevant for force-directed layouts (like fdp, sfdp)
    options += '\tK=1.0; // Adjust spring constant (higher = more spread out)\n';
    // Consider layout engine 'sfdp' for very large graphs
    // options += '\tlayout=sfdp;\n';
  } else {
    options += '\t// Settings for smaller graphs\n';
    options += '\tranksep=0.8; // Default vertical separation\n';
  }

  return options;
};


// --- Main DOT Generation Function ---

/**
 * Generates DOT language code for the entity relationship graph.
 * Defines all nodes and edges at the top level without using subgraphs.
 */
const generateGraphDOT = (
  entities: EnhancedEntity[],
  entityTypes: EntityType[],
  relationships: EnhancedRelationship[],
  relationshipTypes: RelationshipType[]
): string => {
  // Create style maps for efficient lookup during node/edge generation
  const entityTypeStyleMap = createEntityTypeStyleMap(entityTypes);
  const relationshipStyleMap = createRelationshipTypeStyleMap(relationshipTypes);

  // Start building the DOT graph string
  // Using 'graph' for undirected graph. Use 'digraph' for directed arrows.
  let dot = 'graph ecosystem {\n';

  // Add graph-level layout options
  dot += createGraphLayoutOptions(entities, relationships);

  // Define default node styling (applied if no specific type style is found)
  dot += '\t// Default node style\n';
  dot += '\tnode [shape=box, style=filled, color="#f3f4f6", fontname="Arial"];\n';

  // Define default edge styling (applied if no specific type style is found)
  dot += '\t// Default edge style\n';
  dot += '\tedge [fontname="Arial", fontsize=10, color="#6b7280"]; // Default grey edges\n';

  dot += '\n\t// Node Definitions\n';
  // Add all entity nodes with their specific styling
  entities.forEach(entity => {
    // Get the styling string from the map based on the entity's type ID
    // Fallback to an empty string if no specific style is found (defaults will apply)
    const styling = entity.type?.id && entityTypeStyleMap[entity.type.id]
      ? entityTypeStyleMap[entity.type.id]
      : ''; // Rely on graph default node style

    // Escape double quotes within the label if necessary
    const label = (entity.name || `Entity ${entity.id}`).replace(/"/g, '\\"');

    // Add the node definition line to the DOT string
    // Format: node_id [attribute1=value1, attribute2=value2, label="Node Label"];
    dot += `\t${entity.id} [${styling}, label="${label}"];\n`;
  });

  dot += '\n\t// Edge Definitions\n';
  // Add all relationship edges with their specific styling
  relationships.forEach(rel => {
    // Ensure both start and end entities exist for the relationship
    // (This check might be redundant if data integrity is guaranteed upstream)
    if (rel.startEntityId == null || rel.endEntityId == null) {
      console.warn(`Skipping relationship with missing start/end ID: ${JSON.stringify(rel)}`);
      return; // Skip this relationship if IDs are missing
    }

    // Get the styling string from the map based on the relationship's type ID
    // Fallback to an empty string if no specific style is found
    const styling = rel.type?.id && relationshipStyleMap[rel.type.id]
      ? relationshipStyleMap[rel.type.id]
      : ''; // Rely on graph default edge style

    // Add the edge definition line to the DOT string
    // Format: start_node -- end_node [attribute1=value1, label="Edge Label"];
    // Use "--" for undirected graphs, "->" for directed.
    // Add edge label if needed: `[${styling}, label="${rel.type?.name || ''}"]`
    dot += `\t${rel.startEntityId} -- ${rel.endEntityId} [${styling}];\n`;
  });

  // Close the graph definition
  dot += '}';
  return dot;
};

export default generateGraphDOT;