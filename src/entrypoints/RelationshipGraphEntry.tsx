import generateChart from '@/components/mermaid-renderer/generateChart';
import MermaidRenderer from '@/components/mermaid-renderer/renderer';
import { Loading } from '@/components/ui/loading';
import { useAction } from '@/hooks/useAction';
import { actions } from 'astro:actions';
import { useState } from 'react';

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
        <div className="flex w-full items-center justify-center">
          <Loading />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error.message}</div>
      ) : (
        relationships && (
          <>
            <div className="flex w-full flex-col">
              <h1 className="text-4xl font-bold">Relationship Graph</h1>
              <div className="mt-1 text-sm text-neutral-500">
                A graph of the relationships between different entities
              </div>
            </div>

            <MermaidRenderer
              chart={generateChart(relationships as any)}
              containerClassName="w-full h-full"
            />
          </>
        )
      )}
    </div>
  );
}
