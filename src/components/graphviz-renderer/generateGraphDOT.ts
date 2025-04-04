// src/components/graphviz-renderer/generateGraphDOT.ts
import type {
  Entity,
  EntityType,
  Relationship,
  RelationshipType, // Ensure RelationshipType includes 'weight: string'
} from '@/db/schema';

// --- Type Definitions ---

// Enhanced types add resolved related data
type EnhancedEntity = Entity & { type: EntityType };

// EnhancedRelationship includes the full RelationshipType which has weight as string
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

// Map for relationship type ID to its DOT styling string (from the 'dot' field)
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
 * Creates a mapping of relationship type IDs to only the DOT *styling* strings
 * defined in the database (`type.dot`). Falls back to a default style if missing.
 * This map does NOT include the weight.
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
        // Fallback to a simple default style for the 'dot' part
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
  options += '\toverlap=false; // Try to prevent node overlap\n';
  options += '\tnodesep=0.6; // Minimum space between nodes\n';
  options += '\tbgcolor="transparent"; // Transparent background\n';
  options += '\tpad=0.5; // Padding around the graph\n';

  // Add size-specific layout adjustments
  if (isLargeGraph) {
    options += '\t// Settings for large graphs\n';
    options += '\tranksep=2.0; // Increase vertical separation between ranks\n';
    // K is relevant for force-directed layouts (like fdp, sfdp)
    options += '\tK=1.0; // Adjust spring constant (higher = more spread out)\n';
  } else {
    options += '\t// Settings for smaller graphs\n';
    options += '\tranksep=0.8; // Default vertical separation\n';
  }

  return options;
};


// --- Main DOT Generation Function ---

/**
 * Generates DOT language code for the entity relationship graph.
 * Includes edge weights parsed from the RelationshipType.weight (string) field.
 */
const generateGraphDOT = (
  entities: EnhancedEntity[],
  entityTypes: EntityType[],
  relationships: EnhancedRelationship[],
  relationshipTypes: RelationshipType[] // Pass full relationshipTypes to access weight
): string => {
  // Create style maps for efficient lookup during node/edge generation
  const entityTypeStyleMap = createEntityTypeStyleMap(entityTypes);
  // This map only contains the 'dot' styling string part
  const relationshipTypeDotStyleMap = createRelationshipTypeStyleMap(relationshipTypes);

  // Start building the DOT graph string
  let dot = 'graph ecosystem {\n';

  // Add graph-level layout options
  dot += createGraphLayoutOptions(entities, relationships);

  // Define default node styling
  dot += '\t// Default node style\n';
  dot += '\tnode [shape=box, style=filled, color="#f3f4f6", fontname="Arial"];\n';

  // Define default edge styling - includes default weight
  dot += '\t// Default edge style\n';
  dot += '\tedge [fontname="Arial", fontsize=10, color="#6b7280", weight=1.0];\n';

  dot += '\n\t// Node Definitions\n';
  // Add all entity nodes with their specific styling
  entities.forEach(entity => {
    // Get the styling string from the map based on the entity's type ID
    const styling = entity.type?.id && entityTypeStyleMap[entity.type.id]
      ? entityTypeStyleMap[entity.type.id]
      : ''; // Rely on graph default node style

    // Escape double quotes within the label if necessary
    const label = (entity.name || `Entity ${entity.id}`).replace(/"/g, '\\"');

    // Add the node definition line
    dot += `\t${entity.id} [${styling}, label="${label}"];\n`;
  });

  dot += '\n\t// Edge Definitions\n';
  // Add all relationship edges with their specific styling and weight
  relationships.forEach(rel => {
    if (rel.startEntityId == null || rel.endEntityId == null) {
      console.warn(`Skipping relationship with missing start/end ID: ${JSON.stringify(rel)}`);
      return; // Skip this relationship if IDs are missing
    }

    // --- Build Edge Attributes ---
    const attributes: string[] = [];

    // 1. Get visual styling from the 'dot' field via the map
    const dotStyling = rel.type?.id && relationshipTypeDotStyleMap[rel.type.id]
      ? relationshipTypeDotStyleMap[rel.type.id]
      : ''; // Empty string if no specific dot style

    // Add dotStyling to attributes *if* it's not empty
    if (dotStyling) {
      attributes.push(dotStyling);
    }

    // 2. Get and parse weight from the relationship type object
    let weightValue = 1.0; // Default weight
    // Check if rel.type exists and weight string is present and not empty
    if (rel.type?.weight) {
      const parsedWeight = parseFloat(rel.type.weight);
      // Use parsed weight if it's a valid positive number, otherwise keep default
      if (!isNaN(parsedWeight) && parsedWeight >= 0) {
        weightValue = parsedWeight;
      } else {
        // Log a warning if parsing failed or value is invalid
        console.warn(`Invalid or non-positive weight string "${rel.type.weight}" for relationship type ID ${rel.type.id}. Using default weight 1.0.`);
      }
    } else if (rel.type && !rel.type.weight) {
       // Log if weight is missing or empty, using default
       // console.log(`Weight missing or empty for relationship type ID ${rel.type.id}. Using default weight 1.0.`);
    }
    // Always add the weight attribute (either parsed or default)
    attributes.push(`weight=${weightValue}`);

    // --- Combine attributes into the final string for the edge ---
    const finalAttributeString = attributes.length > 0 ? `[${attributes.join(', ')}]` : '';

    // --- Add the edge definition line to the DOT string ---
    // Use "--" for undirected graphs. Use "->" for directed.
    dot += `\t${rel.startEntityId} -- ${rel.endEntityId} ${finalAttributeString};\n`;
  });

  // Close the graph definition
  dot += '}';
  return dot;
};

export default generateGraphDOT;