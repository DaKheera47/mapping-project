import mermaid from 'mermaid';
import React, { useEffect } from 'react';

mermaid.initialize({
  startOnLoad: true,
});

type Props = {
  chart: string;
};
export default function MermaidRenderer({ chart }: Props) {
  const graphRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderMermaid = async () => {
      if (!graphRef.current) return;

      try {
        const str = await mermaid.render('graphDiv', chart, graphRef.current);

        graphRef.current.innerHTML = str.svg;
      } catch (error) {
        console.error(error);
      }
    };

    renderMermaid();
  }, []);

  return (
    <div className="flex h-full items-center justify-center">
      <div
        ref={graphRef}
        className="flex h-full w-full flex-col items-center justify-center"
      />
    </div>
  );
}
