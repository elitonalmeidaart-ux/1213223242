import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { XIcon } from './icons/XIcon';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';

interface HistoryItemModalProps {
  item: HistoryItem;
  onClose: () => void;
}

const HistoryItemModal: React.FC<HistoryItemModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = item.image;
    link.download = `smar-fx-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
    >
      <div 
        className="w-full max-w-xl aspect-square relative"
        style={{ perspective: '1000px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
            className={`w-full h-full relative transition-transform duration-700`}
            style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
            {/* Front of Card */}
            <div className="absolute w-full h-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl shadow-black/50" style={{ backfaceVisibility: 'hidden' }}>
                <img src={item.image} alt="Generated art from history" className="w-full h-full object-contain" />
            </div>
            
            {/* Back of Card */}
            <div className="absolute w-full h-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 flex flex-col p-6" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <h3 className="text-lg font-semibold text-zinc-100 mb-3 flex-shrink-0">Prompt Used</h3>
                <div className="flex-grow overflow-y-auto pr-2 -mr-4 scrollbar-hide">
                    <p className="text-zinc-400 text-sm whitespace-pre-wrap break-words">{item.prompt}</p>
                </div>
                <div className="flex-shrink-0 mt-6 flex flex-col space-y-3">
                     <button 
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center px-4 py-2.5 bg-zinc-700/50 hover:bg-zinc-700 rounded-full text-sm font-semibold text-zinc-200 transition-colors"
                     >
                        <CopyIcon className="w-4 h-4 mr-2" />
                        {copied ? 'Copied!' : 'Copy Prompt'}
                     </button>
                     <button 
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center px-4 py-2.5 bg-green-600/80 hover:bg-green-600 rounded-full text-sm font-semibold text-white transition-colors"
                     >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download Image
                     </button>
                </div>
            </div>
        </div>
        
        {/* Controls outside the flip */}
        <button onClick={onClose} className="absolute top-2 right-2 z-10 p-2 rounded-full text-white bg-black/40 hover:bg-black/70" aria-label="Close modal">
            <XIcon className="w-6 h-6" />
        </button>
         <button onClick={() => setIsFlipped(!isFlipped)} className="absolute bottom-2 right-2 z-10 p-2 rounded-full text-white bg-black/40 hover:bg-black/70" aria-label="Flip card">
            <RefreshCwIcon className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};

export default HistoryItemModal;