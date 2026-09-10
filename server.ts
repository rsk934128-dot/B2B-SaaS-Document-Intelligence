import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.error('Error initializing Gemini client:', err);
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Document Audit Endpoint
  app.post('/api/ai/audit', async (req, res) => {
    try {
      const { docName, content } = req.body;
      const ai = getGemini();

      if (!ai || !content) {
        // Fallback to client-side engine if no API key
        return res.status(200).json({ status: 'fallback', message: 'Using local engine' });
      }

      const prompt = `You are an elite B2B Enterprise Audit & Document Intelligence AI.
Analyze the following enterprise document: "${docName}".
Document Content:
${content.slice(0, 8000)}

Output valid JSON matching this exact structure:
{
  "docName": "${docName}",
  "docType": "invoice" | "contract" | "cloud_bill" | "iso20022" | "construction_spec" | "general",
  "summaryBn": "Brief Bengali summary of the document and audit findings",
  "summaryEn": "Brief English summary of the document and audit findings",
  "riskScore": number between 0 and 100,
  "confidenceScore": number between 80 and 99,
  "keyEntities": [
    {
      "labelBn": "label in Bengali",
      "labelEn": "label in English",
      "value": "extracted value",
      "status": "normal" | "warning" | "critical" | "verified"
    }
  ],
  "auditFindingsBn": ["Finding 1 in Bengali", "Finding 2 in Bengali"],
  "auditFindingsEn": ["Finding 1 in English", "Finding 2 in English"],
  "financialImpact": {
    "potentialSavingsOrTotal": "$14,107.50",
    "currency": "USD",
    "typeBn": "Description of financial value in Bengali",
    "typeEn": "Description of financial value in English"
  },
  "complianceStatus": [
    {
      "standard": "Standard name (e.g., GAAP, HIPAA, ISO 20022, FinOps)",
      "isCompliant": true,
      "notesBn": "Notes in Bengali",
      "notesEn": "Notes in English"
    }
  ],
  "suggestedActionBn": "Actionable next step in Bengali",
  "suggestedActionEn": "Actionable next step in English"
}
Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      return res.json({ status: 'success', result: parsed });
    } catch (err: any) {
      console.warn('Gemini doc audit error, falling back:', err.message);
      return res.status(200).json({ status: 'fallback', error: err.message });
    }
  });

  // AI Architecture Consultation Endpoint
  app.post('/api/ai/consult', async (req, res) => {
    try {
      const { industry, query, language } = req.body;
      const ai = getGemini();

      if (!ai || !query) {
        return res.status(200).json({ status: 'fallback', message: 'No Gemini key or empty query' });
      }

      const prompt = `You are a Principal Software Architect and B2B SaaS Growth Advisor.
The user is building a B2B SaaS targeting the "${industry}" industry.
User's Question: "${query}"
Respond in ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}.
Provide practical, concrete guidance covering:
1. Recommended MVP Scope (keep it lean and avoid overbuilding)
2. Optimal Technical Stack (Frontend, Backend, Database, AI/Engine)
3. Pricing & Monetization Model ($150-$600/mo or % of savings)
4. Go-To-Market tactic to close the first 10 paying enterprise clients.
Keep the advice clear, professional, well-formatted, and encouraging without fluff.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({ status: 'success', advice: response.text });
    } catch (err: any) {
      console.warn('Gemini consult error:', err.message);
      return res.status(200).json({ status: 'fallback', error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`B2B SaaS Intelligence server running on http://localhost:${PORT}`);
  });
}

startServer();
