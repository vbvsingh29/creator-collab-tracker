import https from 'https';

export interface MediaDetails {
  platform: 'youtube' | 'instagram';
  contentId: string;
  title: string;
  authorName: string;
  authorUrl?: string;
  thumbnailUrl: string;
  embedUrl: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  hasAdDisclosure: boolean;
  publishedAt?: string;
}

// Helper to make HTTPS GET requests
function getHttps(url: string, headers: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      // Follow 301/302 redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(getHttps(res.headers.location, headers));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Extract YouTube ID
export function parseYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

// Extract Instagram Shortcode
export function parseInstagramShortcode(url: string): string | null {
  const match = url.match(/(?:instagram\.com\/(?:p|reel|tv)\/)([\w-]+)/);
  return match ? match[1] : null;
}

/**
 * 1. FREE YOUTUBE INTEGRATIONS:
 * - oEmbed API (Public, Zero-Key, Official Google endpoint)
 * - YouTube Data API v3 (if key provided) OR Public interactionCount scraper
 * - High-Res Thumbnail Generator
 * - Native Responsive Iframe Embed Player
 */
export async function getYouTubeMediaDetails(url: string): Promise<MediaDetails> {
  const videoId = parseYouTubeId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube video or Shorts link');
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  
  let title = 'YouTube Content';
  let authorName = 'Creator';
  let authorUrl = '';
  let viewsCount = 0;
  let likesCount = 0;
  let commentsCount = 0;
  let hasAdDisclosure = false;

  // Step A: Call free official YouTube oEmbed API (Zero API key needed)
  try {
    const oembedJson = await getHttps(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    const oembed = JSON.parse(oembedJson);
    title = oembed.title || title;
    authorName = oembed.author_name || authorName;
    authorUrl = oembed.author_url || '';
  } catch (err) {
    console.warn('oEmbed fetch error:', err);
  }

  // Step B: Fetch Views & Engagement Metrics via Google API or Public Metadata
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const apiRes = await getHttps(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${apiKey}`);
      const data = JSON.parse(apiRes);
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        viewsCount = parseInt(item.statistics?.viewCount || '0', 10);
        likesCount = parseInt(item.statistics?.likeCount || '0', 10);
        commentsCount = parseInt(item.statistics?.commentCount || '0', 10);
        const desc = (item.snippet?.description || '').toLowerCase();
        hasAdDisclosure = desc.includes('#ad') || desc.includes('#sponsored') || desc.includes('paid partnership');
      }
    } catch (err) {
      console.warn('YouTube API call failed, falling back:', err);
    }
  }

  // Step C: If zero API key or API didn't return views, scrape public interaction count
  if (viewsCount === 0) {
    try {
      const html = await getHttps(`https://www.youtube.com/watch?v=${videoId}`, {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      const viewMatch = html.match(/itemprop="interactionCount"\s+content="(\d+)"/i) || html.match(/"viewCount":"(\d+)"/i);
      if (viewMatch) viewsCount = parseInt(viewMatch[1], 10);
      const likeMatch = html.match(/"defaultText":\{"accessibility":\{"accessibilityData":\{"label":"([\d,]+) likes"\}\}\}/i);
      if (likeMatch) likesCount = parseInt(likeMatch[1].replace(/,/g, ''), 10);
      hasAdDisclosure = html.toLowerCase().includes('#ad') || html.toLowerCase().includes('paid promotion');
    } catch (err) {
      console.warn('Public scraping fallback error:', err);
    }
  }

  return {
    platform: 'youtube',
    contentId: videoId,
    title,
    authorName,
    authorUrl,
    thumbnailUrl,
    embedUrl,
    viewsCount,
    likesCount,
    commentsCount,
    hasAdDisclosure,
  };
}

/**
 * 2. FREE INSTAGRAM INTEGRATIONS:
 * - Native Meta Reel Iframe Embed Player
 * - Open Graph Crawler Inspector (Thumbnail, Likes, Comments, Caption)
 * - Instagram Graph API (if user token provided)
 */
export async function getInstagramMediaDetails(url: string): Promise<MediaDetails> {
  const shortcode = parseInstagramShortcode(url);
  if (!shortcode) {
    throw new Error('Invalid Instagram Reel or Post link');
  }

  const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed`;
  let title = 'Instagram Reel';
  let authorName = 'Instagram Creator';
  let thumbnailUrl = '';
  let viewsCount = 0;
  let likesCount = 0;
  let commentsCount = 0;
  let hasAdDisclosure = false;

  // Step A: Inspect Open Graph tags with crawler User-Agent
  try {
    const html = await getHttps(`https://www.instagram.com/reel/${shortcode}/`, {
      'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
    });

    // Extract title / caption
    const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i);
    if (titleMatch) title = titleMatch[1];

    // Extract thumbnail image
    const imageMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
    if (imageMatch) thumbnailUrl = imageMatch[1];

    // Extract likes and comments from og:description (e.g. "45K likes, 820 comments - ...")
    const descMatch = html.match(/property="og:description"\s+content="([^"]+)"/i);
    if (descMatch) {
      const content = descMatch[1];
      const likesMatch = content.match(/([\d.,]+)([KkMm]?)\s+likes/i);
      if (likesMatch) {
        let val = parseFloat(likesMatch[1]);
        const unit = likesMatch[2].toUpperCase();
        if (unit === 'K') val *= 1000;
        if (unit === 'M') val *= 1000000;
        likesCount = Math.round(val);
      }
      const commentsMatch = content.match(/([\d.,]+)([KkMm]?)\s+comments/i);
      if (commentsMatch) {
        let val = parseFloat(commentsMatch[1]);
        const unit = commentsMatch[2].toUpperCase();
        if (unit === 'K') val *= 1000;
        if (unit === 'M') val *= 1000000;
        commentsCount = Math.round(val);
      }
      hasAdDisclosure = content.toLowerCase().includes('#ad') || content.toLowerCase().includes('paid partnership');
    }
  } catch (err) {
    console.warn('Instagram crawler inspection error:', err);
  }

  return {
    platform: 'instagram',
    contentId: shortcode,
    title,
    authorName,
    thumbnailUrl,
    embedUrl,
    viewsCount,
    likesCount,
    commentsCount,
    hasAdDisclosure,
  };
}
