
export interface Shot {
  id: number;
  description: string;
}

export type AspectRatio = '16:9' | '9:16';

export interface AppState {
  background: string | null;
  characters: string[];
  generalScript: string; // New field for overall context
  shots: Shot[];
  aspectRatio: AspectRatio;
  isGenerating: boolean;
  resultImage: string | null;
  error: string | null;
}
