import type { Relationship } from '@/db/schema';

const generateNode = (name: string, index: number): string => {
  // get alphabet at index
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const alphabetIndex = index % alphabet.length;
  const alphabetChar = alphabet[alphabetIndex];

  return `${alphabetChar}[${name}]`;
};

interface Props {
  relationships: Relationship[];
}

export default function generateChart({ relationships }: Props): string {
  const nodeMap = new Map<number, { label: string; name: string }>();
  let nodeOrder: number[] = [];
  let letterCounter = 0;

  relationships.forEach(rel => {
    const { startEntity, endEntity } = rel;
    if (!nodeMap.has(startEntity.id)) {
      letterCounter++;
      nodeMap.set(startEntity.id, {
        label: generateNode(startEntity.name ?? '', letterCounter),
        name: startEntity.name ?? '',
      });
      nodeOrder.push(startEntity.id);
    }

    if (!nodeMap.has(endEntity.id)) {
      letterCounter++;
      nodeMap.set(endEntity.id, {
        label: generateNode(endEntity.name ?? '', letterCounter),
        name: endEntity.name ?? '',
      });
      nodeOrder.push(endEntity.id);
    }
  });

  // Build node definitions
  // For clarity we split into two groups: first half and second half.
  const totalNodes = nodeOrder.length;
  const half = Math.ceil(totalNodes / 2);
  const firstGroup = nodeOrder
    .slice(0, half)
    .map(id => nodeMap.get(id)!.label)
    .join('\n');
  const secondGroup = nodeOrder
    .slice(half)
    .map(id => nodeMap.get(id)!.label)
    .join('\n');

  // Build edge definitions: for each relationship, output an edge from start to end.
  // (Here we assume a solid edge for simplicity; you could vary the style based on relationship.type)
  const edgeLines = relationships
    .map(rel => {
      const startLabel = nodeMap.get(rel.startEntity.id)!.label.split('[')[0]; // get letter only
      const endLabel = nodeMap.get(rel.endEntity.id)!.label.split('[')[0];
      // For demonstration, alternate between a solid edge and a dotted edge
      const edgeStyle = rel.id % 2 === 0 ? '---' : '-.->';
      return `    ${startLabel} ${edgeStyle} ${endLabel}`;
    })
    .join('\n');

  // Construct the full mermaid string
  const mdMermaid = `
graph LR
    %% Define subgraphs for clarity (optional)
    ${firstGroup}

    ${secondGroup}

    %% Example edges
${edgeLines}

    %% Define classes for different node colors/styles
    classDef pink fill:#f9c,stroke:#333,stroke-width:1px;
    classDef teal fill:#aff,stroke:#333,stroke-width:1px;

    %% Apply the classes (first group: pink, second group: teal)
    class ${firstGroup
      .split('\n')
      .map(line => line.split('[')[0])
      .join(',')} pink
    class ${secondGroup
      .split('\n')
      .map(line => line.split('[')[0])
      .join(',')} teal
`;

  return mdMermaid;
}
