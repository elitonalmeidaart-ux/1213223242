import React from 'react';
import { AspectRatioOption } from '../types';

interface AspectRatioSelectorProps {
  options: AspectRatioOption[];
  value: string;
  onChange: (value: string) => void;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ options, value, onChange }) => {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-400 mb-2 block">Aspect Ratio</label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`py-2 px-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              value === option.value
                ? 'bg-green-500 text-zinc-950 shadow-md shadow-green-500/20'
                : 'bg-zinc-800/50 hover:bg-zinc-700/70 text-zinc-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AspectRatioSelector;
