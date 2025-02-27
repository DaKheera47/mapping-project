import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { actions } from 'astro:actions';

export default function SelectDemo() {
  const [value, setValue] = React.useState('');
  const [serverTime, setServerTime] = React.useState('');

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-bold">{serverTime}</h1>

      <Input
        placeholder="Enter your name"
        value={value || ''}
        onChange={e => setValue(e.target.value)}
      />

      <Button
        onClick={() => {
          actions.getServerTime({ name: value }).then(({ data }) => {
            setServerTime(data ?? '');
            setValue('');
          });
        }}
      >
        Submit
      </Button>

      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>

            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
