import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { getYouTubeMediaDetails, getInstagramMediaDetails, getHttps } from '../services/mediaIntegrations';
import { db } from '../db/database';
import { generateAIPitchAndSummary, AIPitchRequest } from '../services/aiPitchAssistant';

export const integrationsRouter = Router();

// Protect integration endpoints with authentication
integrationsRouter.use(requireAuth);

// GET /api/integrations/status
integrationsRouter.get('/status', async (req: AuthRequest, res: Response) => {
  const user = req.userId ? await db.prepare('SELECT instagram_access_token, instagram_account_id FROM users WHERE id = ?').get(req.userId) as any : null;
  const userIgToken = user?.instagram_access_token && user.instagram_access_token.trim();
  const hasYouTubeKey = Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY.trim());
  const hasInstagramToken = Boolean(userIgToken || (process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_ACCESS_TOKEN.trim()));
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
        statusLabel: hasInstagramToken ? 'Meta Graph API Connected (Real Lifetime Insights Active)' : 'Public Open Graph Mode',
        connectedAccountId: user?.instagram_account_id || undefined,
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
            : 'Collabio Built-in Creator Intelligence',
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
        hint: 'Responsive in-app players allow watching live sponsored content without leaving Collabio.'
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
      const user = req.userId ? await db.prepare('SELECT instagram_access_token, instagram_account_id FROM users WHERE id = ?').get(req.userId) as any : null;
      const details = await getInstagramMediaDetails(trimmedUrl, user?.instagram_access_token, user?.instagram_account_id);
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

// POST /api/integrations/instagram/verify-token
integrationsRouter.post('/instagram/verify-token', async (req: AuthRequest, res: Response) => {
  try {
    const { accessToken, accountId } = req.body;
    if (!accessToken || !accessToken.trim()) {
      return res.status(400).json({ success: false, error: 'Meta Access Token is required.' });
    }

    const token = accessToken.trim();
    let metaAccountName = 'Instagram Creator Account';
    let metaUsername = '';
    let detectedAccountId = accountId ? accountId.trim() : '';

    try {
      const meRes = await getHttps(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${token}`);
      const meJson = JSON.parse(meRes);
      if (meJson.error) {
        return res.status(400).json({
          success: false,
          error: `Meta Graph API rejected token: ${meJson.error.message || 'Invalid OAuth token'}`
        });
      }
      metaAccountName = meJson.name || metaAccountName;

      const accountsRes = await getHttps(`https://graph.facebook.com/v21.0/me/accounts?fields=name,instagram_business_account{id,username,name}&access_token=${token}`);
      const accountsJson = JSON.parse(accountsRes);
      if (accountsJson.data && Array.isArray(accountsJson.data)) {
        for (const page of accountsJson.data) {
          if (page.instagram_business_account) {
            detectedAccountId = detectedAccountId || page.instagram_business_account.id;
            metaUsername = page.instagram_business_account.username || metaUsername;
            metaAccountName = page.instagram_business_account.name || metaAccountName;
            break;
          }
        }
      }
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: `Could not verify Meta token: ${err.message}`
      });
    }

    res.json({
      success: true,
      valid: true,
      name: metaAccountName,
      username: metaUsername ? `@${metaUsername}` : undefined,
      accountId: detectedAccountId,
      message: `✓ Meta Graph API verified! Connected to ${metaAccountName}. Real lifetime insights are active.`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/integrations/instagram/save-token
integrationsRouter.post('/instagram/save-token', async (req: AuthRequest, res: Response) => {
  try {
    const { accessToken, accountId } = req.body;
    if (!accessToken || !accessToken.trim()) {
      return res.status(400).json({ success: false, error: 'Access token is required.' });
    }

    const token = accessToken.trim();
    const accId = accountId ? accountId.trim() : '';

    await db.prepare('UPDATE users SET instagram_access_token = ?, instagram_account_id = ? WHERE id = ?').run(token, accId, req.userId);

    res.json({
      success: true,
      message: 'Meta Graph API token saved successfully! Lifetime views & insights are now active for all your Instagram collaborations.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/integrations/instagram/disconnect
integrationsRouter.delete('/instagram/disconnect', async (req: AuthRequest, res: Response) => {
  try {
    await db.prepare('UPDATE users SET instagram_access_token = "", instagram_account_id = "" WHERE id = ?').run(req.userId);
    res.json({
      success: true,
      message: 'Instagram Meta Graph API disconnected. Operating in Open Graph mode.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
