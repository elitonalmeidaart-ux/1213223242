import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface FileUploaderProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ files, setFiles }) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const MAX_FILES = 5;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, MAX_FILES); 
    setFiles(newFiles);
  }, [files, setFiles]);
  
  useEffect(() => {
    const newPreviews: string[] = [];
    if (files.length === 0) {
        setPreviews([]);
        return;
    }

    let processedFiles = 0;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          newPreviews.push(reader.result);
        }
        processedFiles++;
        if (processedFiles === files.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    // FIX: Removed the incorrect cleanup function. `FileReader` generates
    // data URLs which do not need to be revoked with `revokeObjectURL`.
    // This prevents potential runtime errors.
  }, [files]);


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: MAX_FILES,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="text-sm font-medium text-zinc-400 mb-2 block">Reference Images (Up to 5)</label>
      <div
        {...getRootProps()}
        className={`w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${isDragActive ? 'border-green-500 bg-green-900/20' : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'}`
        }
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <UploadIcon className="w-8 h-8 text-zinc-500 mb-2" />
          <p className="text-zinc-400">
            {isDragActive ? 'Drop the files here...' : "Drag 'n' drop, or click to select"}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Up to {MAX_FILES} images (PNG, JPG)</p>
        </div>
      </div>
      
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group aspect-square">
              <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-md" />
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white/80 hover:text-white hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100"
                aria-label="Remove image"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;