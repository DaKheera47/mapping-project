import type { Relationship } from "@/db/schema";

const generateNode = (name: string | null): string => {
  if (!name || name === "") {
    return "";
  }

  const noSpaceName = name.replace(/ /g, "");
  return `  ci${noSpaceName}((${name}))\n`;
};

const generateEdge = (start: string | null, end: string | null): string => {
  if (!start || start === "" || !end || end === "") {
    return "";
  }

  const noSpaceStart = start.replace(/ /g, "");
  const noSpaceEnd = end.replace(/ /g, "");

  return `  ci${noSpaceStart} --- ci${noSpaceEnd}\n`;
};

interface Props {
  relationships: Relationship[];
}

export default function generateChart({ relationships }: Props): string {
  // sort relationships by number of relationships that entity shows up in either start or end
  // we want to show the most connected entities first
  // entities doesn't have a relationships array
  // so we need to calculate the number of relationships for each entity
  // and then sort the entities based on that

  let entities = relationships.reduce((acc, relationship) => {
    if (!acc[relationship.startEntity.name]) {
      acc[relationship.startEntity.name] = 0;
    }

    if (!acc[relationship.endEntity.name]) {
      acc[relationship.endEntity.name] = 0;
    }

    acc[relationship.startEntity.name]++;
    acc[relationship.endEntity.name]++;

    return acc;
  }, {} as Record<string, number>);
  console.log(entities);

  relationships = relationships.sort((a, b) => {
    return entities[b.startEntity.name] + entities[b.endEntity.name] -
      entities[a.startEntity.name] - entities[a.endEntity.name];
  }).reverse();

  let mdMermaid = `
graph TD
${
    relationships.map((relationship) =>
      generateNode(relationship.startEntity.name)
    ).join("")
  }

${
    relationships.map((relationship) =>
      generateNode(relationship.endEntity.name)
    ).join("")
  }

${
    relationships
      .map((relationship) =>
        generateEdge(
          relationship.startEntity.name,
          relationship.endEntity.name,
        )
      )
      .join("")
  }
`;

  console.log(mdMermaid);

  return mdMermaid;
}
