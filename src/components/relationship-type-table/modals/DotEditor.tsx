import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loading } from '@/components/ui/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { useEffect, useState } from 'react';

// Simplified interface with most common edge styling options
interface EdgeStyle {
  color: string;
  style: 'solid' | 'dashed' | 'dotted' | 'bold';
  penwidth: number;
  label: string;
  fontcolor: string;
}

// Parse dot string to edge style object
const parseDotString = (dotString: string): EdgeStyle => {
  const defaultStyle: EdgeStyle = {
    color: '#000000',
    style: 'solid',
    penwidth: 1.0,
    label: '',
    fontcolor: '#000000',
  };

  if (!dotString) return defaultStyle;

  // Parse each attribute
  dotString.split(',').forEach(attr => {
    const pair = attr.trim().split('=');
    if (pair.length !== 2) return;

    const [key, rawValue] = [pair[0].trim(), pair[1].trim()];

    // Remove surrounding quotes if present
    const value = rawValue.replace(/^"(.*)"$/, '$1');

    if (key === 'color') defaultStyle.color = value;
    if (
      key === 'style' &&
      ['solid', 'dashed', 'dotted', 'bold'].includes(value)
    ) {
      defaultStyle.style = value as any;
    }
    if (key === 'penwidth') defaultStyle.penwidth = parseFloat(value) || 1.0;
    if (key === 'fontcolor') defaultStyle.fontcolor = value;
  });

  return defaultStyle;
};

// Convert edge style object to dot string
const edgeStyleToDotString = (style: EdgeStyle): string => {
  const parts = [
    `color="${style.color}"`,
    `style=${style.style}`,
    `penwidth=${style.penwidth}`,
  ];

  return parts.join(', ');
};

interface DotEditorProps {
  initialDot: string;
  onSave: (dot: string) => void;
}

const DotEditor = ({ initialDot, onSave }: DotEditorProps) => {
  const [style, setStyle] = useState<EdgeStyle>(parseDotString(initialDot));
  const [previewSvg, setPreviewSvg] = useState<string>('');

  // Update the preview whenever style changes
  useEffect(() => {
    const generatePreview = async () => {
      try {
        const dotString = edgeStyleToDotString(style);

        // Create a simple preview graph
        const previewDot = `
          graph preview {
            node [shape=box, style=filled, color=lightblue];
            A -- B [${dotString}];
            A [label="Entity A"];
            B [label="Entity B"];
          }
        `;

        const graphviz = await Graphviz.load();
        const svg = graphviz.dot(previewDot);
        setPreviewSvg(svg);

        // Also update the parent component
        onSave(dotString);
      } catch (error) {
        console.error('Error generating preview:', error);
      }
    };

    generatePreview();
  }, [style, onSave]);

  // Update a specific property in the style object
  const updateStyle = (key: keyof EdgeStyle, value: any) => {
    setStyle(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <Label htmlFor="color">Line Color</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="color"
                type="color"
                value={style.color}
                onChange={e => updateStyle('color', e.target.value)}
                className="h-8 w-12 p-0"
              />
              <Input
                value={style.color}
                onChange={e => updateStyle('color', e.target.value)}
                className="flex-1"
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="style">Line Style</Label>
            <Select
              value={style.style}
              onValueChange={value => updateStyle('style', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select line style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Line Thickness: {style.penwidth}</Label>
            <Slider
              value={[style.penwidth]}
              min={0.5}
              max={5}
              step={0.5}
              onValueChange={values => updateStyle('penwidth', values[0])}
              className="mt-4"
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Preview</Label>
          <div className="flex h-48 items-center justify-center overflow-hidden rounded-md border bg-white p-4">
            {previewSvg ? (
              <div dangerouslySetInnerHTML={{ __html: previewSvg }} />
            ) : (
              <Loading />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DotEditor;
