import { cn } from '@/lib/utils';
import mermaid from 'mermaid';
import React, { useEffect } from 'react';
import svgPanZoom from 'svg-pan-zoom';

mermaid.initialize({
  startOnLoad: true,
});

type Props = {
  chart: string;
  containerClassName?: string;
};
export default function MermaidRenderer({ chart, containerClassName }: Props) {
  const graphRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderMermaid = async () => {
      try {
        if (!graphRef.current) return;

        const str = await mermaid.render('graphDiv', chart, graphRef.current);

        graphRef.current.innerHTML = str.svg;

        // Once rendered, select the SVG element and apply pan-zoom functionality
        const svgElement = graphRef.current.querySelector('svg');
        if (svgElement) {
          svgPanZoom(svgElement, {
            zoomEnabled: true,
            panEnabled: true,
            controlIconsEnabled: true,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    renderMermaid();
  }, []);

  return (
    <div
      className={cn(
        'flex h-full items-center justify-center',
        containerClassName
      )}
    >
      <div
        ref={graphRef}
        className="flex h-full w-full flex-col items-center justify-center [&_svg]:h-full [&_svg]:w-full [&_svg]:!max-w-full [&_svg]:rounded-md [&_svg]:border [&_svg]:border-gray-200 [&_svg]:shadow-md"
      />
    </div>
  );
}
