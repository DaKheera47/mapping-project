import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import type {
  Entity,
  EntityType,
  Relationship,
  RelationshipType,
} from '@/db/schema';
import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { House, Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
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
  const graphRef = useRef<HTMLDivElement>(null);
  const transformComponentRef = useRef(null);

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

        // Process SVG to ensure it fills container but maintain original viewBox
        const processedSvg = svgOutput.replace(
          '<svg ',
          '<svg width="100%" height="100%" '
        );

        setSvg(processedSvg);
        setLoading(false);
      } catch (err: any) {
        console.error('Error generating graph:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    renderGraph();
  }, [entities, relationships, relationshipTypes, entityTypes, rerenderFlag]);

  // Process the SVG after it's been rendered to ensure it fits correctly
  useEffect(() => {
    if (!loading && graphRef.current) {
      const svgElement = graphRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');

        // We'll preserve the original viewBox if it exists,
        // as modifying it can cause issues with the reset behavior
      }
    }
  }, [loading, svg]);

  // Custom reset function to ensure proper reset behavior
  const handleReset = (resetTransform: () => void) => {
    if (transformComponentRef.current) {
      // First reset to initial scale (1.0)
      resetTransform();

      // Optional: Add a slight delay to ensure the transform is applied before any additional adjustments
      setTimeout(() => {
        // If needed, you could add additional centering logic here
      }, 50);
    } else {
      // Fallback if ref is not available
      resetTransform();
    }
  };

  if (loading) return <Loading />;
  if (error)
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="graph-container flex h-full w-full items-center justify-center overflow-hidden rounded-lg border shadow-lg">
      <TransformWrapper
        initialScale={1}
        initialPositionX={0}
        initialPositionY={0}
        minScale={0.1}
        maxScale={5}
        limitToBounds={false}
        centerOnInit={true} // Center the content initially
        velocityAnimation={{ disabled: true }}
        doubleClick={{
          disabled: false,
          mode: 'reset', // Reset on double click
        }}
        panning={{
          disabled: false,
          velocityDisabled: true,
        }}
        wheel={{
          disabled: false,
          step: 0.1,
        }}
        pinch={{
          disabled: false,
        }}
        zoomAnimation={{
          disabled: false,
          size: 10,
          animationTime: 0,
          animationType: 'easeOut',
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button onClick={() => zoomIn(0.2)} aria-label="Zoom in">
                <Plus />
              </Button>

              <Button onClick={() => zoomOut(0.2)} aria-label="Zoom out">
                <Minus />
              </Button>

              <Button
                onClick={() => handleReset(resetTransform)}
                aria-label="Reset zoom"
              >
                <House />
              </Button>
            </div>

            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%' }}
              // @ts-ignore
              ref={transformComponentRef}
            >
              <div
                ref={graphRef}
                className="graph-svg-container"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default GraphVizRenderer;
