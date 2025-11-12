import React from 'react';

interface GeneratedImageProps {
  src: string | null;
  isLoading: boolean;
  onRefine: () => void;
  refinementPrompt: string;
  setRefinementPrompt: (prompt: string) => void;
  elapsedTime: number;
}

const GeneratedImage: React.FC<GeneratedImageProps> = ({ src, isLoading, onRefine, refinementPrompt, setRefinementPrompt, elapsedTime }) => {
  
  if (isLoading && !src) {
    return (
      <div className="w-full max-w-lg aspect-square flex items-center justify-center bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl">
        <div className="text-center">
            <div className="font-mono text-4xl text-green-400">{elapsedTime}s</div>
            <p className="text-zinc-500 mt-2">Conjuring pixels...</p>
        </div>
      </div>
    );
  }

  if (!src) {
    return (
      <div className="w-full max-w-lg aspect-square flex items-center justify-center bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl">
        <p className="text-zinc-600 text-center px-8">Your creation will appear here</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
        <div className="relative w-full max-w-2xl aspect-square">
             {isLoading && (
                 <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="font-mono text-3xl text-green-400">{elapsedTime}s</div>
                        <p className="text-zinc-400 mt-1 text-sm">Refining...</p>
                    </div>
                 </div>
             )}
             <img 
                src={src} 
                alt="Generated image" 
                className={`w-full h-full object-contain rounded-2xl shadow-2xl shadow-black/50 transition-opacity duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`} 
            />
        </div>
        
        <div className="w-full max-w-2xl p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
             <label className="text-sm font-medium text-zinc-400 mb-2 block">Refine Image</label>
            <div className="flex space-x-3">
                <input
                    type="text"
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                    placeholder="e.g., Change the background to a beach"
                    className="flex-grow p-3 bg-zinc-800/50 rounded-full border border-zinc-700 focus:ring-2 focus:ring-green-500 focus:outline-none text-zinc-100 placeholder-zinc-500"
                />
                <button
                    onClick={onRefine}
                    disabled={isLoading}
                    className="bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-200 font-semibold py-3 px-6 rounded-full transition-colors"
                >
                    {isLoading ? '...' : 'Refine'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default GeneratedImage;