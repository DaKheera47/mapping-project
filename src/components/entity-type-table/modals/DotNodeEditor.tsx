// components/DotNodeEditor.tsx
import { Button } from '@/components/ui/button';
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

// Define the node style interface
interface NodeStyle {
  shape: string;
  color: string;
  style: string;
  fontsize: number;
  fontcolor: string;
  width: number;
  height: number;
}

// Parse dot string to node style object
const parseDotString = (dotString: string): NodeStyle => {
  const defaultStyle: NodeStyle = {
    shape: 'box',
    color: '#d1d5db', // Light gray
    style: 'filled',
    fontsize: 12,
    fontcolor: '#000000',
    width: 1.5,
    height: 1,
  };

  if (!dotString) return defaultStyle;

  // Parse each attribute
  dotString.split(',').forEach(attr => {
    const pair = attr.trim().split('=');
    if (pair.length !== 2) return;

    const [key, rawValue] = [pair[0].trim(), pair[1].trim()];

    // Remove surrounding quotes if present
    const value = rawValue.replace(/^"(.*)"$/, '$1');

    if (key === 'shape') defaultStyle.shape = value;
    if (key === 'color') defaultStyle.color = value;
    if (key === 'style') defaultStyle.style = value;
    if (key === 'fontsize') defaultStyle.fontsize = parseInt(value) || 12;
    if (key === 'fontcolor') defaultStyle.fontcolor = value;
    if (key === 'width') defaultStyle.width = parseFloat(value) || 1.5;
    if (key === 'height') defaultStyle.height = parseFloat(value) || 1;
  });

  return defaultStyle;
};

// Convert node style object to dot string
const nodeStyleToDotString = (style: NodeStyle): string => {
  return [
    `shape=${style.shape}`,
    `color="${style.color}"`,
    `style=${style.style}`,
    `fontsize=${style.fontsize}`,
    `fontcolor="${style.fontcolor}"`,
    `width=${style.width}`,
    `height=${style.height}`,
  ].join(', ');
};

interface DotNodeEditorProps {
  initialDot: string;
  onSave: (dot: string) => void;
  entityTypeName: string;
}

const DotNodeEditor = ({
  initialDot,
  onSave,
  entityTypeName,
}: DotNodeEditorProps) => {
  const [style, setStyle] = useState<NodeStyle>(parseDotString(initialDot));
  const [previewSvg, setPreviewSvg] = useState<string>('');

  // Update the preview whenever style changes
  useEffect(() => {
    const generatePreview = async () => {
      try {
        const dotString = nodeStyleToDotString(style);

        // Create a preview graph with the entity type name
        const previewDot = `
          graph preview {
            node [${dotString}];
            entity [label="${entityTypeName || 'Entity'}"];
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
  }, [style, entityTypeName, onSave]);

  // Update a specific property in the style object
  const updateStyle = (key: keyof NodeStyle, value: any) => {
    setStyle(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <Label htmlFor="shape">Shape</Label>
            <Select
              value={style.shape}
              onValueChange={value => updateStyle('shape', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select shape" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="box">Box</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="ellipse">Ellipse</SelectItem>
                <SelectItem value="diamond">Diamond</SelectItem>
                <SelectItem value="hexagon">Hexagon</SelectItem>
                <SelectItem value="octagon">Octagon</SelectItem>
                <SelectItem value="plaintext">Plain Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Style</Label>
            <Select
              value={style.style}
              onValueChange={value => updateStyle('style', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="color">Fill Color</Label>
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
                placeholder="#d1d5db"
              />
            </div>
          </div>

          <div>
            <Label>Font Size: {style.fontsize}</Label>
            <Slider
              value={[style.fontsize]}
              min={8}
              max={24}
              step={1}
              onValueChange={values => updateStyle('fontsize', values[0])}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="fontcolor">Font Color</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="fontcolor"
                type="color"
                value={style.fontcolor}
                onChange={e => updateStyle('fontcolor', e.target.value)}
                className="h-8 w-12 p-0"
              />
              <Input
                value={style.fontcolor}
                onChange={e => updateStyle('fontcolor', e.target.value)}
                className="flex-1"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Width: {style.width}</Label>
              <Slider
                value={[style.width]}
                min={0.5}
                max={3}
                step={0.1}
                onValueChange={values => updateStyle('width', values[0])}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Height: {style.height}</Label>
              <Slider
                value={[style.height]}
                min={0.5}
                max={3}
                step={0.1}
                onValueChange={values => updateStyle('height', values[0])}
                className="mt-2"
              />
            </div>
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

          <div className="mt-4">
            <Label className="mb-2 block">Generated DOT String</Label>
            <div className="overflow-x-auto rounded-md bg-gray-100 p-2 font-mono text-sm">
              {nodeStyleToDotString(style)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DotNodeEditor;
