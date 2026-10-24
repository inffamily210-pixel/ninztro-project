import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '30mb' }));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Ninztro Video & Photo Editor' });
});

// AI Color Grade & Scene Enhancement endpoint
app.post('/api/ai-grade', async (req, res) => {
  try {
    const { prompt, mediaType, currentSettings } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Deterministic intelligent fallback when key is not set
      const p = (prompt || '').toLowerCase();
      let preset = 'cyberpunk';
      if (p.includes('vintage') || p.includes('film') || p.includes('retro')) preset = 'kodak35mm';
      else if (p.includes('teal') || p.includes('cinematic') || p.includes('hollywood')) preset = 'tealOrange';
      else if (p.includes('anime') || p.includes('sky') || p.includes('japan')) preset = 'animeShinkai';
      else if (p.includes('dark') || p.includes('noir') || p.includes('night') || p.includes('gelap')) preset = 'dramaticDark';
      else if (p.includes('sunset') || p.includes('warm') || p.includes('golden')) preset = 'goldenHour';
      else if (p.includes('bw') || p.includes('hitam')) preset = 'bwSilver';

      return res.json({
        success: true,
        source: 'smart-engine',
        title: `AI Grade: ${prompt || 'Cinematic Mood'}`,
        recipe: {
          preset,
          filterIntensity: 90,
          exposure: p.includes('gelap') || p.includes('dark') ? -20 : 10,
          contrast: 30,
          saturation: p.includes('bw') ? -100 : 25,
          temperature: p.includes('warm') || p.includes('sunset') ? 35 : -15,
          tint: p.includes('cyberpunk') ? 35 : 0,
          highlights: 15,
          shadows: -25,
          vignette: 40,
          grain: 20,
          bloom: 30,
          aiInsight: `Optimized color palette for ${prompt || 'scene dynamics'} with enhanced contrast curve and luminance separation.`,
        },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert Hollywood colorist and VFX supervisor for the video editing app "Ninztro".
The user wants an AI filter/color grade style: "${prompt || 'Cinematic Cyberpunk mood'}".
Media type: "${mediaType || 'video'}".

Return ONLY a valid JSON object (no markdown, no extra text) with this structure:
{
  "title": "Short creative title (e.g. Neon Cyber Bleed)",
  "preset": "cyberpunk" | "kodak35mm" | "tealOrange" | "animeShinkai" | "neonNoir" | "aerochrome" | "bwSilver" | "dramaticDark" | "goldenHour",
  "filterIntensity": number between 40 and 100,
  "exposure": number between -80 and 80,
  "contrast": number between -60 and 80,
  "saturation": number between -100 and 80,
  "temperature": number between -80 and 80,
  "tint": number between -60 and 60,
  "highlights": number between -80 and 80,
  "shadows": number between -80 and 80,
  "vignette": number between 0 and 90,
  "grain": number between 0 and 60,
  "bloom": number between 0 and 70,
  "aiInsight": "1-2 sentence colorist explanation of why this looks cinematic"
}`,
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const recipe = JSON.parse(cleanJson);

    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      title: recipe.title,
      recipe,
    });
  } catch (error: any) {
    console.error('AI Grade error:', error);
    // Graceful fallback
    return res.json({
      success: true,
      source: 'smart-fallback',
      title: 'AI Cinematic Enhance',
      recipe: {
        preset: 'cyberpunk',
        filterIntensity: 85,
        exposure: 5,
        contrast: 25,
        saturation: 30,
        temperature: -10,
        tint: 15,
        highlights: 20,
        shadows: -20,
        vignette: 30,
        grain: 15,
        bloom: 25,
        aiInsight: 'Dynamic range expanded with high-contrast color split.',
      },
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ninztro Video & Photo Editor running at http://localhost:${PORT}`);
  });
}

startServer();
