import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { getYouTubeMediaDetails, getInstagramMediaDetails } from '../services/mediaIntegrations';
import { generateAIPitchAndSummary, AIPitchRequest } from '../services/aiPitchAssistant';

export const integrationsRouter = Router();

// Protect integration endpoints with authentication
integrationsRouter.use(requireAuth);

// GET /api/integrations/status
integrationsRouter.get('/status', (_req: AuthRequest, res: Response) => {
  const hasYouTubeKey = Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY.trim());
  const hasInstagramToken = Boolean(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_ACCESS_TOKEN.trim());
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());

  res.json({
    success: true,
    integrations: {
      youtube: {
        id: 'youtube',
        name: 'YouTube Integration',
        enabled: true,
        status: hasYouTubeKey ? 'official_api' : 'fallback_scraper',
        statusLabel: hasYouTubeKey ? 'Official Data API v3 Active' : 'Zero-Key Public oEmbed & Scraper',
        hasKey: hasYouTubeKey,
        quota: hasYouTubeKey ? '10,000 requests/day free' : 'Unlimited public requests',
        features: [
          { name: 'Live Views Counter', active: true },
          { name: 'Live Likes Counter', active: true },
          { name: 'Official oEmbed Video Titles', active: true },
          { name: 'High-Res Thumbnail Fetcher', active: true },
          { name: 'In-App Responsive Embed Player', active: true },
          { name: '#ad Compliance Scanner', active: true },
        ],
        hint: hasYouTubeKey 
          ? 'Connected via your Google Cloud YouTube API Key.'
          : 'Operating in Zero-Key mode. To enable official Google API rate limits, add YOUTUBE_API_KEY to server/.env.'
      },
      instagram: {
        id: 'instagram',
        name: 'Instagram Integration',
        enabled: true,
        status: hasInstagramToken ? 'graph_api' : 'crawler_active',
        statusLabel: hasInstagramToken ? 'Meta Graph API Connected' : 'Public Open Graph & Reel Embed',
        hasKey: hasInstagramToken,
        quota: hasInstagramToken ? '~200 requests/hour per user' : 'Standard public web limits',
        features: [
          { name: 'Native Meta Reel Embed Player', active: true },
          { name: 'Likes & Comments Inspection', active: true },
          { name: 'Public Thumbnail Extractor', active: true },
          { name: '#ad & Disclosure Checker', active: true },
          { name: 'Creator Reach & Insights (Requires Meta Token)', active: hasInstagramToken },
        ],
        hint: hasInstagramToken
          ? 'Connected via Meta Graph API Access Token.'
          : 'Operating in Open Graph Crawler mode. Native Reel player and public metrics are active.'
      },
      aiPitchEngine: {
        id: 'aiPitch',
        name: 'AI Pitch & Reel Intelligence Studio',
        enabled: true,
        status: (hasGeminiKey || hasOpenAIKey) ? 'live_llm' : 'builtin_smart_engine',
        statusLabel: hasGeminiKey 
          ? 'Google Gemini 1.5 Flash Connected' 
          : hasOpenAIKey 
            ? 'OpenAI GPT-4o mini Connected' 
            : 'CollabFlow Built-in Creator Intelligence',
        hasKey: Boolean(hasGeminiKey || hasOpenAIKey),
        quota: hasGeminiKey ? '15 requests/minute free (Gemini Flash)' : 'Unlimited (Zero-Key Built-in)',
        features: [
          { name: 'Reel-Wise Performance Analytics', active: true },
          { name: 'Historical Engagement Rate Benchmarking', active: true },
          { name: 'AI Sponsor Pitch & Proposal Generator', active: true },
          { name: 'Automated Multi-Touch Package Builder', active: true },
          { name: 'Delivered CPM Negotiation Defense', active: true },
          { name: 'Google Gemini Free API & OpenAI Support', active: true }
        ],
        hint: hasGeminiKey || hasOpenAIKey
          ? 'Live generative LLM connected for real-time natural language synthesis.'
          : 'Operating in Zero-Key mode. Supports free Google Gemini API or custom user keys directly in the UI.'
      },
      embedPlayers: {
        id: 'embeds',
        name: 'Native In-App Media Players',
        enabled: true,
        status: 'active',
        statusLabel: 'Operational',
        features: [
          { name: 'YouTube Embed Iframe (1080p / 4K)', active: true },
          { name: 'Instagram Captioned Reel Player', active: true },
          { name: 'Zero API Quota Cost', active: true }
        ],
        hint: 'Responsive in-app players allow watching live sponsored content without leaving CollabFlow.'
      }
    }
  });
});

// POST /api/integrations/test-media (Live test tool for YouTube/Instagram links)
integrationsRouter.post('/test-media', async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || !url.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a valid content URL.' });
    }

    const trimmedUrl = url.trim();
    const cleanUrl = trimmedUrl.toLowerCase();

    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      const details = await getYouTubeMediaDetails(trimmedUrl);
      return res.json({
        success: true,
        platform: 'youtube',
        data: details,
        message: `Successfully verified YouTube content: "${details.title}"`
      });
    } else if (cleanUrl.includes('instagram.com')) {
      const details = await getInstagramMediaDetails(trimmedUrl);
      return res.json({
        success: true,
        platform: 'instagram',
        data: details,
        message: `Successfully verified Instagram Reel (${details.contentId})`
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unsupported domain. Please provide a YouTube video/Shorts or Instagram Reel link.'
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/integrations/ai-pitch (Reel-Wise Summarizer & Future Pitch Intelligence Engine)
integrationsRouter.post('/ai-pitch', async (req: AuthRequest, res: Response) => {
  try {
    const payload = req.body as AIPitchRequest;
    if (!payload.targetBrand) {
      payload.targetBrand = 'Brand Partner';
    }

    const result = await generateAIPitchAndSummary(payload);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
