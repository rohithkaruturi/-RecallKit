export {
  getGroqClient,
  generateContentWithGroq,
  getMockGroqResponse,
} from './groqService';

export const getGeminiClient = () => {
  throw new Error('This project now uses Groq. Import from ./groqService instead.');
};

export const generateContentWithGemini = async (prompt: string) => {
  const { generateContentWithGroq } = await import('./groqService');
  return generateContentWithGroq(prompt);
};
