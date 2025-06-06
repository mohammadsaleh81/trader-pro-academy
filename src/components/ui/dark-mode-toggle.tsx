
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/hooks/use-dark-mode';

export const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className="relative overflow-hidden transition-all duration-300 hover:scale-110"
      aria-label={isDarkMode ? "تغییر به حالت روز" : "تغییر به حالت شب"}
    >
      <div className={`absolute inset-0 transition-transform duration-500 ${isDarkMode ? 'rotate-0' : 'rotate-90'}`}>
        <Moon className={`h-4 w-4 transition-opacity duration-300 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} />
      </div>
      <div className={`absolute inset-0 transition-transform duration-500 ${isDarkMode ? '-rotate-90' : 'rotate-0'}`}>
        <Sun className={`h-4 w-4 transition-opacity duration-300 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`} />
      </div>
    </Button>
  );
};
