
import React from 'react';
import { Shot } from '../types';

interface ShotEditorProps {
  shot: Shot;
  onChange: (text: string) => void;
}

const ShotEditor: React.FC<ShotEditorProps> = ({ shot, onChange }) => {
  const isFirst = shot.id === 1;

  return (
    <div className={`flex gap-3 items-start p-3 rounded-xl border transition-colors ${
      isFirst ? 'bg-black/40 border-white/5 opacity-60' : 'bg-white/5 border-white/5 focus-within:border-blue-500/50'
    }`}>
      <div className="flex flex-col items-center justify-center min-w-[50px] pt-1">
        <span className="text-[10px] text-gray-500 font-bold uppercase">镜头</span>
        <span className="text-lg font-bold text-gray-300">{String(shot.id).padStart(2, '0')}</span>
      </div>
      
      <div className="flex-1">
        {isFirst ? (
          <div className="py-2 text-sm italic text-gray-600">
            纯黑色画面 (系统默认)
          </div>
        ) : (
          <textarea
            value={shot.description}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`描述镜头 ${shot.id} 的构图、动作或情绪...`}
            className="w-full bg-transparent border-none text-sm text-gray-200 placeholder-gray-600 focus:ring-0 resize-none h-12 py-1"
          />
        )}
      </div>
      
      {!isFirst && shot.description && (
        <div className="pt-2">
          <i className="fas fa-check-circle text-blue-500 text-xs"></i>
        </div>
      )}
    </div>
  );
};

export default ShotEditor;
