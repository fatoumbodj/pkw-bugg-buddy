import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
  presets?: string[];
}

export const ColorPicker = ({ color, onChange, label, presets }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const defaultPresets = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#6366F1', '#F97316', '#14B8A6', '#A855F7'
  ];
  
  const colorPresets = presets || defaultPresets;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10"
          >
            <div
              className="w-6 h-6 rounded border border-border"
              style={{ backgroundColor: color }}
            />
            <span>{color}</span>
            <Palette className="w-4 h-4 ml-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="color-input">Couleur personnalisée</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="color-input"
                  type="color"
                  value={color}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={color}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Couleurs prédéfinies</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset}
                    className="w-8 h-8 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: preset }}
                    onClick={() => {
                      onChange(preset);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};