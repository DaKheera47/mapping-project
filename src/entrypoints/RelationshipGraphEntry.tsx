import MermaidRenderer from '@/components/mermaid-renderer/renderer';

const mdMermaid = `
graph TD
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
    <div className="h-full">
      <div>
        <h1 className="text-3xl font-bold">Relationship Graph</h1>
      </div>

      <MermaidRenderer chart={mdMermaid} containerClassName="w-3/5 h-full" />
    </div>
  );
}
