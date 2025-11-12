import React from 'react';
import { CameraControlState } from '../types';
import { SettingsIcon } from './icons/SettingsIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ResetIcon } from './icons/ResetIcon';
import { useState } from 'react';

interface CameraControlsProps {
  state: CameraControlState;
  setState: React.Dispatch<React.SetStateAction<CameraControlState>>;
}

const SliderControl: React.FC<{label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void, onReset: () => void}> = 
({label, value, min, max, step, onChange, onReset}) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-zinc-400">{label}</label>
            <div className="flex items-center space-x-2">
                <span className="text-xs font-mono bg-zinc-900/50 px-2 py-0.5 rounded-md text-zinc-300 w-12 text-center">{value.toFixed(1)}</span>
                 <button onClick={onReset} className="text-zinc-500 hover:text-green-400" title={`Reset ${label}`}>
                    <ResetIcon className="w-4 h-4"/>
                </button>
            </div>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-zinc-700/50 rounded-lg appearance-none cursor-pointer range-thumb:bg-green-500"
            style={{'--thumb-color': '#4ade80'} as React.CSSProperties}
        />
    </div>
);


const CameraControls: React.FC<CameraControlsProps> = ({ state, setState }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const handleResetAll = () => {
        setState({ rotation: 0, zoom: 0, verticalAngle: 0, wideAngle: false });
    };

    return (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3"
            >
                <div className="flex items-center">
                    <SettingsIcon className="w-5 h-5 mr-3 text-zinc-400" />
                    <h2 className="text-base font-semibold">Advanced Adjustments</h2>
                </div>
                <div className="flex items-center">
                     <button onClick={(e) => { e.stopPropagation(); handleResetAll(); }} className={`mr-2 p-1 rounded-full text-zinc-500 hover:text-green-400 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} title="Reset All">
                        <ResetIcon className="w-4 h-4" />
                    </button>
                    <ChevronDownIcon className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="p-4 pt-0 space-y-5 border-t border-zinc-700/50">
                    <SliderControl 
                        label="Horizontal Rotation"
                        value={state.rotation}
                        min={-90} max={90} step={1}
                        onChange={v => setState(s => ({...s, rotation: v}))}
                        onReset={() => setState(s => ({...s, rotation: 0}))}
                    />
                     <SliderControl 
                        label="Move Forward / Close-Up"
                        value={state.zoom}
                        min={0} max={10} step={1}
                        onChange={v => setState(s => ({...s, zoom: v}))}
                        onReset={() => setState(s => ({...s, zoom: 0}))}
                    />
                     <SliderControl 
                        label="Vertical Angle (Bird/Worm)"
                        value={state.verticalAngle}
                        min={-1} max={1} step={0.1}
                        onChange={v => setState(s => ({...s, verticalAngle: v}))}
                        onReset={() => setState(s => ({...s, verticalAngle: 0}))}
                    />
                    <div className="flex items-center pt-2">
                        <input
                            type="checkbox"
                            id="wideAngle"
                            checked={state.wideAngle}
                            onChange={(e) => setState(s => ({...s, wideAngle: e.target.checked }))}
                            className="h-4 w-4 rounded border-zinc-600 bg-zinc-700 text-green-500 focus:ring-green-600"
                        />
                        <label htmlFor="wideAngle" className="ml-3 block text-sm font-medium text-zinc-300">
                           Wide-Angle Lens
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CameraControls;
