import React, { useState, useCallback, useRef, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import AspectRatioSelector from './components/AspectRatioSelector';
import GeneratedImage from './components/GeneratedImage';
import { translatePrompt, generateImage } from './services/geminiService';
import { AspectRatioOption, HistoryItem, CameraControlState } from './types';
import { maskImageToAspectRatio } from './utils/imageUtils';
import { HistoryIcon } from './components/icons/HistoryIcon';
import HistoryItemModal from './components/HistoryItemModal';
import Logo from './components/Logo';
import CameraControls from './components/CameraControls';
import { XIcon } from './components/icons/XIcon';
import { ExpandIcon } from './components/icons/ExpandIcon';


const aspectRatios: AspectRatioOption[] = [
    { label: '1:1', value: '1:1' },
    { label: '3:4', value: '3:4' },
    { label: '4:3', value: '4:3' },
    { label: '9:16', value: '9:16' },
    { label: '16:9', value: '16:9' },
];

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('smar-fx-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  
  const [cameraState, setCameraState] = useState<CameraControlState>({
    rotation: 0,
    zoom: 0,
    verticalAngle: 0,
    wideAngle: false
  });
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('smar-fx-history', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  }, [history]);
  
  useEffect(() => {
    if (isLoading) {
      setElapsedTime(0);
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
    };
  }, [isLoading]);


  const buildCameraPrompt = useCallback(() => {
    let parts: string[] = [];
    if (cameraState.rotation !== 0) {
      const dir = cameraState.rotation > 0 ? 'right' : 'left';
      parts.push(`camera rotated ${Math.abs(cameraState.rotation)} degrees to the ${dir}`);
    }
    if (cameraState.zoom !== 0) {
      const zoomLevel = Math.abs(cameraState.zoom);
      const zoomDir = cameraState.zoom > 0 ? 'close-up' : 'distant shot';
      parts.push(`${zoomDir} (level ${zoomLevel}/10)`);
    }
    if (cameraState.verticalAngle !== 0) {
      const angle = Math.abs(cameraState.verticalAngle);
      const angleDir = cameraState.verticalAngle > 0 ? `high-angle shot from above (bird's eye view level ${angle})` : `low-angle shot from below (worm's eye view level ${angle})`;
      parts.push(angleDir);
    }
    if (cameraState.wideAngle) {
      parts.push('shot with a wide-angle lens');
    }
    if (parts.length === 0) return '';
    return `\n**Camera Instructions:** ${parts.join(', ')}.`;
  }, [cameraState]);

  const handleGenerate = useCallback(async (isRefinement = false) => {
    const currentPrompt = isRefinement ? refinementPrompt : prompt;
    if (!currentPrompt.trim() && referenceFiles.length === 0) {
      setError('Please enter a prompt or upload a reference image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    if (!isRefinement) {
        setGeneratedImage(null);
    }

    try {
      const cameraPrompt = buildCameraPrompt();
      const finalPrompt = `${currentPrompt}${cameraPrompt}`;
      
      const translated = await translatePrompt(finalPrompt);
      
      const filesToProcess = isRefinement && generatedImage ? [await (await fetch(generatedImage)).blob().then(b => new File([b], "ref.jpg"))] : referenceFiles;

      const processedImages = await Promise.all(
        filesToProcess.map(file => maskImageToAspectRatio(file, aspectRatio))
      );
      const base64Images = processedImages.map(dataUrl => dataUrl.split(',')[1]);

      const resultBase64 = await generateImage(translated, base64Images, aspectRatio);
      const newImageSrc = `data:image/jpeg;base64,${resultBase64}`;
      setGeneratedImage(newImageSrc);
      
      if (!isRefinement) {
        const newHistoryItem: HistoryItem = { image: newImageSrc, prompt: translated };
        setHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]); // Limit history to 50
      }
      setRefinementPrompt('');

    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, refinementPrompt, referenceFiles, aspectRatio, buildCameraPrompt, generatedImage]);
  
  return (
    <div className="min-h-screen font-sans flex flex-col md:flex-row bg-zinc-950 text-zinc-200">
      
      {/* --- CONTROLS PANEL --- */}
      <aside className="w-full md:w-[380px] lg:w-[420px] p-4 sm:p-6 flex-shrink-0 bg-zinc-900/80 backdrop-blur-sm border-r border-zinc-800 flex flex-col">
        <header className="flex justify-between items-center mb-6">
          <Logo />
        </header>
        
        <div className="flex-grow overflow-y-auto space-y-5 pr-2 -mr-2 scrollbar-hide">
          <FileUploader files={referenceFiles} setFiles={setReferenceFiles} />
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-2 block">Prompt</label>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cinematic shot of a..."
                className="w-full h-36 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none text-zinc-100 placeholder-zinc-500"
            />
          </div>
          <AspectRatioSelector
              options={aspectRatios}
              value={aspectRatio}
              onChange={setAspectRatio}
          />
          <CameraControls state={cameraState} setState={setCameraState} />
        </div>

        <div className="mt-6 flex-shrink-0">
          <button
              onClick={() => handleGenerate(false)}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 disabled:cursor-not-allowed disabled:text-zinc-500 text-zinc-950 font-bold py-3 px-4 rounded-full flex items-center justify-center transition-all duration-300 text-lg"
          >
              {isLoading ? `Generating... (${elapsedTime}s)` : 'Generate Image'}
          </button>
          {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
        </div>
      </aside>

      {/* --- MAIN CONTENT (IMAGE DISPLAY) --- */}
      <main className="flex-1 flex flex-col p-4 sm:p-6">
        <div className="w-full flex justify-end mb-4">
             <button onClick={() => setIsHistoryOpen(true)} className="p-3 rounded-full hover:bg-zinc-800 transition-colors" title="History">
                <HistoryIcon className="w-6 h-6 text-zinc-400" />
            </button>
        </div>
        <div className="flex-1 flex items-center justify-center w-full h-full">
            <GeneratedImage
                src={generatedImage}
                isLoading={isLoading}
                onRefine={() => handleGenerate(true)}
                refinementPrompt={refinementPrompt}
                setRefinementPrompt={setRefinementPrompt}
                elapsedTime={elapsedTime}
            />
        </div>
      </main>

      {/* --- HISTORY PANEL --- */}
      <div className={`fixed top-0 right-0 h-full w-[380px] bg-zinc-900/80 backdrop-blur-md border-l border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b border-zinc-800 flex-shrink-0">
                <h2 className="text-xl font-semibold">History</h2>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 rounded-full hover:bg-zinc-700">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="overflow-y-auto p-4 flex-grow scrollbar-hide">
                {history.length === 0 ? (
                    <p className="text-zinc-500 text-center mt-8">No images generated yet.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {history.map((item, index) => (
                           <div key={index} className="group relative aspect-square cursor-pointer rounded-lg overflow-hidden" onClick={() => setSelectedHistoryItem(item)}>
                                <img src={item.image} alt={item.prompt.slice(0, 30)} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                   <ExpandIcon className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {selectedHistoryItem && (
        <HistoryItemModal 
            item={selectedHistoryItem}
            onClose={() => setSelectedHistoryItem(null)}
        />
      )}
    </div>
  );
};

export default App;