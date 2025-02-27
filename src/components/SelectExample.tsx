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
  const [error, setError] = React.useState('');

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col items-center justify-center space-y-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          {serverTime || 'No server time yet'}
        </h1>

        {error && <p className="text-red-500">{error}</p>}
      </div>

      <Input
        placeholder="Enter your name"
        value={value || ''}
        onChange={e => setValue(e.target.value)}
      />

      <Button
        onClick={async () => {
          const { data, error } = await actions.getServerTime({ name: value });

          if (error) {
            setError(error.message);
            return;
          }

          setServerTime(data ?? '');
          setValue('');
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
