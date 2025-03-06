import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { MoonIcon, SunIcon } from 'lucide-react';

export default function ThemeDropdown() {
  const onClickLight = () => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  };

  const onClickDark = () => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <SunIcon className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <MoonIcon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onClickLight}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={onClickDark}>Dark</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
