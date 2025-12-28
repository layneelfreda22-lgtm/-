
import React from 'react';

interface FileUploaderProps {
  label: string;
  image: string | null;
  onUpload: (base64: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ label, image, onUpload }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <label className={`block w-full h-40 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden relative ${
        image ? 'border-blue-500/50' : 'border-white/10 hover:border-white/20'
      }`}>
        {image ? (
          <img src={image} alt="预览" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500 px-4 text-center">
            <i className="fas fa-cloud-upload-alt text-2xl"></i>
            <span className="text-xs">点击上传图片</span>
          </div>
        )}
        <input type="file" className="hidden" accept="image/*" onChange={handleChange} />
        
        {image && (
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">点击更换</span>
          </div>
        )}
      </label>
    </div>
  );
};

export default FileUploader;
