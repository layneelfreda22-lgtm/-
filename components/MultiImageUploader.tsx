
import React from 'react';

interface MultiImageUploaderProps {
  label: string;
  images: string[];
  onUpload: (base64: string) => void;
  onRemove: (index: number) => void;
  max?: number;
}

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ label, images, onUpload, onRemove, max = 4 }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Fix: Explicitly type 'file' as 'File' to avoid 'unknown' type error during iteration
      Array.from(files).forEach((file: File) => {
        if (images.length >= max) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          onUpload(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="relative w-full">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label} ({images.length}/{max})</p>
      <div className="grid grid-cols-2 gap-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative h-24 rounded-lg overflow-hidden border border-white/10 group">
            <img src={img} alt={`Ref ${idx}`} className="w-full h-full object-cover" />
            <button 
              onClick={() => onRemove(idx)}
              className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
        {images.length < max && (
          <label className="h-24 rounded-lg border-2 border-dashed border-white/10 hover:border-blue-500/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-gray-500">
            <i className="fas fa-plus text-sm"></i>
            <span className="text-[10px]">添加参考</span>
            <input type="file" className="hidden" accept="image/*" multiple onChange={handleChange} />
          </label>
        )}
      </div>
    </div>
  );
};

export default MultiImageUploader;
