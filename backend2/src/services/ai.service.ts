import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';

// Pengganti IAiService / AiService C# - Gemini AI Financial Controller

const MODEL = 'gemini-flash-latest';

const SYSTEM_INSTRUCTION = `You are the resident AI Financial Controller for Aumo Finance in Indonesia.
Analyse accounting and financial queries with precision, discipline, and absolute accuracy.
Provide concise, actionable insights in professional English or Indonesian.

CURRENCY MANDATE:
1. ALL monetary values MUST be presented in Indonesian Rupiah (Rp).
2. NEVER use USD, Dollar, or the '$' symbol under any circumstances.
3. Use dot (.) as thousand separators and comma (,) for decimals (e.g., Rp 1.500.000,00 or Rp 250.000).
4. Do not make assumptions beyond rational economic logic.`;

export class AiService {
    private readonly apiKey: string;

    constructor() {
        this.apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.Gemini__ApiKey || '';
    }

    get isConfigured(): boolean {
        return !!this.apiKey;
    }

    async analyzeFinancialQuery(userPrompt: string, contextData: string = ''): Promise<string> {
        if (!this.apiKey || this.apiKey.trim() === '') {
            logger.warn('Gemini API Key is not configured.');
            return 'AI Service is currently offline. Please configure the Gemini API key.';
        }

        try {
            const fullPrompt = !contextData || contextData.trim() === ''
                ? userPrompt
                : `Context Financial Data:\n${contextData}\n\nUser Question: ${userPrompt}`;

            const requestBody = {
                system_instruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                },
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: fullPrompt }]
                    }
                ]
            };

            const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${this.apiKey}`;

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000); // 30s

            let response: Response;
            try {
                response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody),
                    signal: controller.signal
                });
            } finally {
                clearTimeout(timeout);
            }

            if (!response.ok) {
                const errorBody = await response.text().catch(() => 'no body');
                logger.error({ status: response.status, body: errorBody }, 'Gemini API returned error');
                return 'Unable to generate AI analysis at this moment. Please try again later.';
            }

            const json = await response.json() as any;

            // C#: doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString()
            const text = json?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;

            if (!text || text.trim() === '') {
                return 'Unable to generate AI analysis at this moment. Please try again later.';
            }

            return text;
        } catch (err: any) {
            if (err.name === 'AbortError') {
                logger.error('Gemini API timeout');
            } else {
                logger.error({ err }, 'Error calling Gemini API');
            }
            return 'Unable to generate AI analysis at this moment. Please try again later.';
        }
    }

    // Alias untuk kompatibilitas dengan interface lama
    async analyzeFinancialQueryAsync(userPrompt: string, contextData: string = ''): Promise<string> {
        return this.analyzeFinancialQuery(userPrompt, contextData);
    }
}

export const aiService = new AiService();
