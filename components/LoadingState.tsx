
import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "正在排版 3x3 网格...",
  "分析环境参考图...",
  "同步人物一致性...",
  "渲染电影级光影...",
  "校准相机拍摄角度...",
  "添加镜头索引标签...",
  "强化 8K 超清细节...",
  "正在完成色彩校正...",
];

const LoadingState: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-12">
      <div className="relative mb-8">
        <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fas fa-film text-blue-500 text-xl animate-pulse"></i>
        </div>
      </div>
      <h3 className="text-xl font-medium text-white mb-2">正在构思分镜</h3>
      <p className="text-blue-400 text-sm h-6 transition-all duration-500">
        {MESSAGES[msgIndex]}
      </p>
      <div className="mt-8 flex gap-1 justify-center">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" 
            style={{ animationDelay: `${i * 0.15}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
