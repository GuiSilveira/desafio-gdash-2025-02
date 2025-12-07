export interface IAIService {
  generateContent(
    prompt: string,
    options?: AIGenerateOptions,
  ): Promise<string | null>;
}

export interface AIGenerateOptions {
  model?: string;
  responseMimeType?: string;
}

export const AI_SERVICE = 'AI_SERVICE';
