import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const integrationsRouter = Router();

// Protect integration info with auth
integrationsRouter.use(requireAuth);

// GET /api/integrations/status
integrationsRouter.get('/status', (_req: AuthRequest, res: Response) => {
  const hasYouTubeKey = Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY.trim());
  const hasInstagramToken = Boolean(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_ACCESS_TOKEN.trim());

  res.json({
    success: true,
    integrations: {
      youtube: {
        id: 'youtube',
        name: 'YouTube Integration',
        enabled: true,
        status: hasYouTubeKey ? 'official_api' : 'fallback_scraper',
        statusLabel: hasYouTubeKey ? 'Official Data API v3 Active' : 'Zero-Key Public Scraper Mode',
        hasKey: hasYouTubeKey,
        quota: hasYouTubeKey ? '10,000 requests/day free' : 'Unlimited (rate-limited by IP)',
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
        statusLabel: hasInstagramToken ? 'Meta Graph API Connected' : 'Public Open Graph & Embed Mode',
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
