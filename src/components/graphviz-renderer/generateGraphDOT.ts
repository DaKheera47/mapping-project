import type {
  Entity,
  EntityType,
  Relationship,
  RelationshipType,
} from "@/db/schema";
import type { EnhancedRelationship } from "./renderer";

interface EntityMap {
  [key: number]: Entity & { type: EntityType | null };
}

interface InternalRelationshipsMap {
  [key: number]: (Relationship & {
    type: RelationshipType | null;
    startEntity: Entity;
    endEntity: Entity;
  })[];
}

/**
 * Creates a mapping of relationship type IDs to styling strings
 */
const createRelationshipTypeStyleMap = (
  relationshipTypes: RelationshipType[],
): { [key: number]: string } => {
  const styleMap: { [key: number]: string } = {};
  relationshipTypes.forEach((type) => {
    if (type.id && type.dot) {
      styleMap[type.id] = type.dot;
    } else if (type.id) {
      // Default styling if .dot is not provided
      styleMap[type.id] = "color=black";
    }
  });
  return styleMap;
};

/**
 * Generates DOT language code for the entity relationship graph
 */
const generateGraphDOT = (
  entities: (Entity & { type: EntityType })[],
  relationships: EnhancedRelationship[],
  relationshipTypes: RelationshipType[],
): string => {
  // Create a map for quick entity lookup
  const entityMap: EntityMap = {};
  entities.forEach((entity) => {
    entityMap[entity.id] = entity;
  });

  // Create a map for relationship type styling
  const relationshipStyleMap = createRelationshipTypeStyleMap(
    relationshipTypes,
  );

  // Group relationships by parent entity (for subgraphs)
  const internalRelationships: InternalRelationshipsMap = {};
  const externalRelationships: EnhancedRelationship[] = [];

  // Separate division/employee relationships (internal) from others
  relationships.forEach((rel) => {
    if (
      rel.type?.name?.includes("Employee") ||
      rel.type?.name?.includes("Division")
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
  let dot = "graph ecosystem {\n";
  dot += "\tsplines=true;\n";
  dot += "\toverlap=false;\n";

  // Add subgraphs for entities with internal relationships
  Object.keys(internalRelationships).forEach((hostIdStr) => {
    const hostId = Number(hostIdStr);
    const host = entityMap[hostId];
    if (!host) return;

    dot += `\tsubgraph cluster${host.id} {\n`;
    dot += `\t\tnode [style=filled,color=white];\n`;
    dot += `\t\tstyle=filled;\n`;
    dot += `\t\tcolor=lightgrey;\n`;
    dot += `\t\tlabel="${host.name || ""}";\n`;

    internalRelationships[hostId].forEach((rel) => {
      dot += `\t\t${rel.endEntityId};\n`;
    });

    dot += "\t};\n";
  });

  // Add external relationships with styling from relationship type
  externalRelationships.forEach((rel) => {
    const styling = rel.type?.id && relationshipStyleMap[rel.type.id]
      ? `[${relationshipStyleMap[rel.type.id]}]`
      : "";

    dot += `\t${rel.startEntityId} -- ${rel.endEntityId} ${styling};\n`;
  });

  // Style nodes based on entity type
  entities.forEach((entity) => {
    // Skip entities that are part of subgraphs with internal relationships
    if (internalRelationships[entity.id]) return;

    // Style based on entity type
    const typeName = entity.type?.name || "";

    if (typeName === "Person") {
      dot +=
        `\t${entity.id} [shape=circle, color=yellow, style=filled, fontsize=8, label="${
          entity.name || ""
        }"];\n`;
    } else if (typeName === "Company") {
      dot +=
        `\t${entity.id} [shape=box, color=lightblue, style=filled, label="${
          entity.name || ""
        }"];\n`;
    } else if (typeName === "Government Organisation") {
      dot +=
        `\t${entity.id} [shape=box, color=lightgreen, style=filled, label="${
          entity.name || ""
        }"];\n`;
    } else if (typeName === "University") {
      dot += `\t${entity.id} [shape=box, color=orange, style=filled, label="${
        entity.name || ""
      }"];\n`;
    } else if (typeName === "Partnership") {
      dot += `\t${entity.id} [shape=ellipse, color=red, style=filled, label="${
        entity.name || ""
      }"];\n`;
    } else if (typeName === "Collective") {
      dot += `\t${entity.id} [shape=ellipse, color=cyan, style=filled, label="${
        entity.name || ""
      }"];\n`;
    } else if (typeName === "Association") {
      dot +=
        `\t${entity.id} [shape=ellipse, color=lightgrey, style=filled, label="${
          entity.name || ""
        }"];\n`;
    } else if (typeName === "Division") {
      dot +=
        `\t${entity.id} [shape=ellipse, color=lightgrey, style=line, label="${
          entity.name || ""
        }"];\n`;
    } else {
      dot += `\t${entity.id} [label="${entity.name || ""}"];\n`;
    }
  });

  dot += "}";
  return dot;
};

export default generateGraphDOT;
