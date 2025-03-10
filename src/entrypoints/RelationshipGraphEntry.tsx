import generateChart from '@/components/mermaid-renderer/generateChart';
import MermaidRenderer from '@/components/mermaid-renderer/renderer';
import { Button } from '@/components/ui/button';
import { useAction } from '@/hooks/useAction';
import { actions } from 'astro:actions';
import { RotateCw } from 'lucide-react';
import { useState } from 'react';

const mindMapMd = `
graph TD
  ciStJohn((St John Crean))
  ciLancaster((Lancaster University))
  ciAndy((Andy))
  ciIan((Ian))
  ciUCLan((UCLan))
  ciRob((Rob))

  ciIan --> ciStJohn
  ciRob --> ciStJohn
  ciRob --> ciAndy
  ciRob --> ciUCLan
  ciIan --> ciAndy
  ciIan --> ciLancaster
`;

type Props = {};
export default function RelationshipGraph({}: Props) {
  const [flag, setFlag] = useState(false);
  const {
    data: relationships,
    error,
    loading,
  } = useAction(actions.relationships.getAllRelationships, {}, flag);

  return (
    <div className="container mx-auto flex h-full w-full flex-col items-center space-y-4 py-10">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error.message}</div>
      ) : (
        relationships && (
          <>
            <div className="flex w-full flex-col">
              <div className="flex items-center space-x-4">
                <h1 className="text-4xl font-bold">Relationship Graph</h1>
                <Button variant="outline" onClick={() => setFlag(!flag)}>
                  <RotateCw />
                </Button>
              </div>
              <div className="mt-1 text-sm text-neutral-500">
                A graph of the relationships between different entities
              </div>
            </div>

            <MermaidRenderer
              chart={generateChart(relationships as any)}
              // chart={mindMapMd}
              containerClassName="w-full h-full"
            />
          </>
        )
      )}
    </div>
  );
}
