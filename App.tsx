
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AppState, Shot, AspectRatio } from './types';
import FileUploader from './components/FileUploader';
import ShotEditor from './components/ShotEditor';
import LoadingState from './components/LoadingState';
import MultiImageUploader from './components/MultiImageUploader';

const INITIAL_SHOTS: Shot[] = [
  { id: 1, description: "纯黑色画面 (固定)" },
  { id: 2, description: "" },
  { id: 3, description: "" },
  { id: 4, description: "" },
  { id: 5, description: "" },
  { id: 6, description: "" },
  { id: 7, description: "" },
  { id: 8, description: "" },
  { id: 9, description: "" },
];

export default function App() {
  const [state, setState] = useState<AppState>({
    background: null,
    characters: [],
    generalScript: "", // Initial empty script
    shots: INITIAL_SHOTS,
    aspectRatio: '16:9',
    isGenerating: false,
    resultImage: null,
    error: null,
  });

  const handleCharacterUpload = (base64: string) => {
    setState(prev => ({ ...prev, characters: [...prev.characters, base64], error: null }));
  };

  const removeCharacter = (index: number) => {
    setState(prev => ({ ...prev, characters: prev.characters.filter((_, i) => i !== index) }));
  };

  const handleShotChange = (id: number, text: string) => {
    setState(prev => ({
      ...prev,
      shots: prev.shots.map(s => s.id === id ? { ...s, description: text } : s)
    }));
  };

  const generateGrid = async () => {
    if (!state.background || state.characters.length === 0) {
      setState(prev => ({ ...prev, error: "请上传背景环境图和至少一张人物参考图。" }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null, resultImage: null }));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const shotDescriptions = state.shots
        .filter(s => s.id > 1)
        .map(s => `Shot ${String(s.id).padStart(2, '0')}: ${s.description || 'Cinematic shot continuing the scene.'}`)
        .join('\n');

      const prompt = `
        Task: Create a cohesive 3x3 storyboard grid (9 panels) in ONE single image.
        Format: ${state.aspectRatio} Aspect Ratio Grid.
        
        OVERALL SCRIPT CONTEXT:
        ${state.generalScript || "No general script provided, focus on visual consistency."}

        STRICT COMPOSITION RULES:
        1. Layout: A single high-res image divided into a perfect 3x3 grid (9 equal panels).
        2. Shot 01: MUST be SOLID PURE BLACK.
        3. Shot 02-09: Follow the specific shot details below, while staying true to the OVERALL SCRIPT CONTEXT.
        4. Consistency: 
           - Character: Use the reference images for IDENTICAL face, hair, and clothing in all panels.
           - Environment: Use the background reference for the exact same room/location and lighting style.
        5. Labels: Overlay a small white text "Shot 01" to "Shot 09" in the top-left of each panel.
        
        SHOT DETAILS:
        ${shotDescriptions}

        QUALITY: 8K resolution, high-end cinema look, professional framing.
      `;

      const characterParts = state.characters.map(char => ({
        inlineData: { data: char.split(',')[1], mimeType: 'image/png' }
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { data: state.background.split(',')[1], mimeType: 'image/png' } },
            ...characterParts
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: state.aspectRatio
          }
        }
      });

      let foundImage = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            foundImage = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (foundImage) {
        setState(prev => ({ ...prev, resultImage: foundImage, isGenerating: false }));
      } else {
        throw new Error("生成失败：未返回图像数据。");
      }
    } catch (err: any) {
      setState(prev => ({ ...prev, isGenerating: false, error: err.message || "生成出错。" }));
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto">
      <header className="w-full text-center mb-8">
        <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-bold tracking-widest mb-4">
          PRO STORYBOARD MASTER
        </div>
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-4">
          电影 9 宫格分镜生成
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start">
        <div className="space-y-6">
          {/* Asset Section */}
          <section className="glass p-6 rounded-2xl">
            <h2 className="text-sm font-black mb-4 flex items-center gap-2 text-white uppercase tracking-widest">
              <i className="fas fa-camera-retro text-blue-500"></i> 参考素材
            </h2>
            <div className="space-y-6">
              <FileUploader 
                label="环境背景参考" 
                image={state.background} 
                onUpload={(b) => setState(prev => ({ ...prev, background: b }))} 
              />
              <MultiImageUploader 
                label="人物/角色参考 (多图)" 
                images={state.characters} 
                onUpload={handleCharacterUpload}
                onRemove={removeCharacter}
              />
            </div>
          </section>

          {/* Script Section */}
          <section className="glass p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-black flex items-center gap-2 text-white uppercase tracking-widest">
                <i className="fas fa-file-alt text-purple-500"></i> 剧本文案设定
              </h2>
              <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setState(prev => ({ ...prev, aspectRatio: ratio }))}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      state.aspectRatio === ratio ? 'bg-blue-600 text-white' : 'text-gray-600'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block tracking-widest">总体剧情描述 / 剧本文案</label>
              <textarea
                value={state.generalScript}
                onChange={(e) => setState(prev => ({ ...prev, generalScript: e.target.value }))}
                placeholder="在此粘贴完整剧本或故事梗概，AI将参考此内容生成所有镜头..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-200 focus:border-blue-500/50 focus:ring-0 min-h-[120px] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block tracking-widest">单镜头详细说明 (Shot 02-09)</label>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {state.shots.map((shot) => (
                  <ShotEditor 
                    key={shot.id} 
                    shot={shot} 
                    onChange={(text) => handleShotChange(shot.id, text)} 
                  />
                ))}
              </div>
            </div>
          </section>

          <button
            onClick={generateGrid}
            disabled={state.isGenerating}
            className={`w-full py-5 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
              state.isGenerating 
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {state.isGenerating ? <><i className="fas fa-spinner fa-spin"></i> 处理中...</> : <><i className="fas fa-magic"></i> 生成 3x3 分镜网格</>}
          </button>
          
          {state.error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs">{state.error}</div>}
        </div>

        {/* Output Section */}
        <div className="sticky top-8">
          <div className="glass p-3 rounded-2xl min-h-[600px] flex flex-col">
            <div className={`flex-1 rounded-xl bg-[#050505] border border-white/5 flex items-center justify-center overflow-hidden transition-all ${
              state.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-w-[400px] mx-auto'
            }`}>
              {state.isGenerating ? <LoadingState /> : state.resultImage ? (
                <div className="relative group w-full h-full">
                  <img src={state.resultImage} className="w-full h-full object-contain" />
                  <a href={state.resultImage} download="storyboard.png" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-black px-6 py-2 rounded-full font-bold">下载高清原图</span>
                  </a>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-700">
                  <i className="fas fa-film text-4xl mb-4 block"></i>
                  <p className="text-xs uppercase tracking-widest">等待生成结果</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
