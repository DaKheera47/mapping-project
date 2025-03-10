import type {
  Entity,
  EntityType,
  Relationship,
  RelationshipType,
} from '@/db/schema';
import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { useEffect, useState } from 'react';
import generateGraphDOT from './generateGraphDOT';

// Define enhanced relationship type for graph processing
export type EnhancedRelationship = Relationship & {
  type: RelationshipType | null;
  startEntity: Entity;
  endEntity: Entity;
};

export interface GraphProps {
  entities: (Entity & { type: EntityType })[];
  entityTypes: EntityType[];
  rerenderFlag: boolean;
  relationships: EnhancedRelationship[];
  relationshipTypes: RelationshipType[];
}

const GraphVizRenderer = ({
  entities,
  entityTypes,
  relationships,
  relationshipTypes,
  // this forces a rerender when the flag changes
  rerenderFlag,
}: GraphProps) => {
  const [svg, setSvg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderGraph = async () => {
      try {
        // Generate the DOT representation of the graph
        const dot = generateGraphDOT(
          entities,
          entityTypes,
          relationships,
          relationshipTypes
        );

        // Render the graph using Graphviz
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
  }, [entities, relationships, relationshipTypes, rerenderFlag]);

  if (loading) return <div>Loading graph...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="graph-container">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
};

export default GraphVizRenderer;
