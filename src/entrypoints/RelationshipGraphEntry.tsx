import MermaidRenderer from '@/components/mermaid-renderer/renderer';

const mdMermaid = `
graph LR
    %% Define subgraphs for clarity (optional)
    A[Kerry Yates]
    B[Ian Bain]
    C[Simon Cook]
    D[Shubm Esan]
    E[Victoria Milone]
    F[Sarah Henry]
    G[Don Williams]
    H[Andy Whale]
    I[Rob Attey]
    J[Andrea Schilde]

    K[BHE]
    L[DMTC DAB]
    M[UCira]
    N[NWC]
    O[University of Lancaster]
    P[NEF]

    %% Example edges
    A --- K
    B --- K
    B --- C
    B -.-> D
    D -.-> E
    F --- O
    G --- O
    I --- M
    H --- K
    K --- L
    L --- M
    M --- N
    O --- P
    P --- A

    %% Define classes for different node colors/styles
    classDef pink fill:#f9c,stroke:#333,stroke-width:1px;
    classDef teal fill:#aff,stroke:#333,stroke-width:1px;

    %% Apply the classes
    class A,B,C,D,E,F,G,H,I,J pink
    class K,L,M,N,O,P teal
`;

type Props = {};
export default function RelationshipGraph({}: Props) {
  return (
    <div className="container mx-auto flex h-full w-full flex-col items-center space-y-4 py-10">
      <div className="flex flex-col w-full">
        <h1 className="text-4xl font-bold">Relationship Graph</h1>
        <div className="mt-1 text-sm text-neutral-500">
          A graph of the relationships between different entities
        </div>
      </div>

      <MermaidRenderer chart={mdMermaid} containerClassName="w-full h-full" />
    </div>
  );
}
