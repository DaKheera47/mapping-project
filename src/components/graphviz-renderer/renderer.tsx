import type {
  Entity,
  EntityType,
  Relationship,
  RelationshipType,
} from '@/db/schema';
import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { useEffect, useState } from 'react';

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

interface GraphProps {
  entities: (Entity & { type: EntityType })[];
  rerenderFlag: boolean;
  relationships: (Relationship & {
    type: RelationshipType | null;
    startEntity: Entity;
    endEntity: Entity;
  })[];
}

const EntityGraph = ({
  entities,
  relationships,
  // this forces a rerender when the flag changes
  rerenderFlag,
}: GraphProps) => {
  const [svg, setSvg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderGraph = async () => {
      try {
        // Create a map for quick entity lookup
        const entityMap: EntityMap = {};
        entities.forEach(entity => {
          entityMap[entity.id] = entity;
        });

        // Group relationships by parent entity (for subgraphs)
        const internalRelationships: InternalRelationshipsMap = {};
        const externalRelationships: (Relationship & {
          type: RelationshipType | null;
          startEntity: Entity;
          endEntity: Entity;
        })[] = [];

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

        // Add external relationships
        externalRelationships.forEach(rel => {
          dot += `\t${rel.startEntityId} -- ${rel.endEntityId};\n`;
        });

        // Style nodes based on entity type
        entities.forEach(entity => {
          // Skip entities that are part of subgraphs with internal relationships
          if (internalRelationships[entity.id]) return;

          // Style based on entity type
          const typeName = entity.type?.name || '';

          if (typeName === 'Person') {
            dot += `\t${entity.id} [shape=circle, color=yellow, style=filled, fontsize=8, label="${entity.name || ''}"];\n`;
          } else if (typeName === 'Company') {
            dot += `\t${entity.id} [shape=box, color=lightblue, style=filled, label="${entity.name || ''}"];\n`;
          } else if (typeName === 'Government Organisation') {
            dot += `\t${entity.id} [shape=box, color=lightgreen, style=filled, label="${entity.name || ''}"];\n`;
          } else if (typeName === 'University') {
            dot += `\t${entity.id} [shape=box, color=orange, style=filled, label="${entity.name || ''}"];\n`;
          } else if (typeName === 'Partnership') {
            dot += `\t${entity.id} [shape=ellipse, color=red, style=filled, label="${entity.name || ''}"];\n`;
          } else if (typeName === 'Collective') {
            dot += `\t${entity.id} [shape=ellipse, color=cyan, style=filled, label="${entity.name || ''}"];\n`;
          } else if (typeName === 'Association') {
            dot += `\t${entity.id} [shape=ellipse, color=lightgrey, style=filled, label="${entity.name || ''}"];\n`;
          } else if (typeName === 'Division') {
            dot += `\t${entity.id} [shape=ellipse, color=lightgrey, style=line, label="${entity.name || ''}"];\n`;
          } else {
            dot += `\t${entity.id} [label="${entity.name || ''}"];\n`;
          }
        });

        dot += '}';

        // Render the graph
        const graphviz = await Graphviz.load();
        const svgOutput = graphviz.dot(dot);
        setSvg(svgOutput);
        setLoading(false);
      } catch (err: any) {
        console.error('Error generating graph:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    renderGraph();
  }, [entities, relationships, rerenderFlag]);

  if (loading) return <div>Loading graph...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="graph-container">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
};

export default EntityGraph;
