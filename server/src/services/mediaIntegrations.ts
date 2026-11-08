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
  // Data quality indicators
  metricsSource: 'official_api' | 'public_scrape' | 'oembed_only' | 'unavailable';
  metricsNote?: string;
}

// Helper to make HTTPS GET requests with status code validation and redirect following
function getHttps(url: string, headers: Record<string, string> = {}, timeoutMs = 7000): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers, timeout: timeoutMs }, (res) => {
      // Follow 301/302 redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(getHttps(res.headers.location, headers, timeoutMs));
      }
      if (res.statusCode && res.statusCode >= 400) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject).on('timeout', () => reject(new Error('Connection timed out')));
  });
}

// Extract YouTube video ID — handles all URL formats
export function parseYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i);
  return match ? match[1] : null;
}

// Extract Instagram shortcode — handles /p/, /reel/, /reels/, /tv/, /share/reel/
export function parseInstagramShortcode(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:instagram\.com\/(?:p|reels?|tv|share\/reel|share\/p)\/)([\w-]+)/i);
  return match ? match[1] : null;
}

/**
 * YouTube Integration:
 * - Step A: oEmbed API (official, zero-key, always free) → title + channel name
 * - Step B: YouTube Data API v3 (requires YOUTUBE_API_KEY) → real views, likes, comments, description
 * - Step C: Public HTML scraper fallback (no key) → may work if not blocked by datacenter
 * - If all metric sources fail: returns 0 counts with metricsSource='unavailable' — NO fake data
 */
export async function getYouTubeMediaDetails(url: string): Promise<MediaDetails> {
  const videoId = parseYouTubeId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube link. Please paste a valid YouTube video, Shorts, or Live link.');
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  let title = '';
  let authorName = '';
  let authorUrl = '';
  let viewsCount = 0;
  let likesCount = 0;
  let commentsCount = 0;
  let hasAdDisclosure = false;
  let publishedAt = '';
  let metricsSource: MediaDetails['metricsSource'] = 'unavailable';
  let metricsNote: string | undefined;

  // ── Step A: oEmbed — always free, no key required, gets title + channel ──
  try {
    const oembedJson = await getHttps(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    const oembed = JSON.parse(oembedJson);
    if (oembed.title) title = oembed.title;
    if (oembed.author_name) authorName = oembed.author_name;
    if (oembed.author_url) authorUrl = oembed.author_url;
    metricsSource = 'oembed_only';
  } catch {
    // oEmbed unavailable — private video or network error
    title = 'YouTube Video';
    authorName = 'YouTube Creator';
  }

  // ── Step B: Official YouTube Data API v3 — real metrics if key provided ──
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (apiKey) {
    try {
      const apiRes = await getHttps(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${apiKey}`
      );
      const data = JSON.parse(apiRes);
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        viewsCount    = parseInt(item.statistics?.viewCount    || '0', 10);
        likesCount    = parseInt(item.statistics?.likeCount    || '0', 10);
        commentsCount = parseInt(item.statistics?.commentCount || '0', 10);
        publishedAt   = item.snippet?.publishedAt || '';

        // Override title/author with authoritative snippet data
        if (item.snippet?.title)       title      = item.snippet.title;
        if (item.snippet?.channelTitle) authorName = item.snippet.channelTitle;

        const desc = (item.snippet?.description || '').toLowerCase();
        hasAdDisclosure = desc.includes('#ad') || desc.includes('#sponsored') || desc.includes('paid partnership');

        metricsSource = 'official_api';
        console.log(`✅ [YouTube API] ${title}: ${viewsCount.toLocaleString()} views, ${likesCount.toLocaleString()} likes`);
      } else {
        metricsNote = 'Video not found or is private/deleted.';
        console.warn(`⚠️ [YouTube API] No results for video ID: ${videoId}`);
      }
    } catch (err: any) {
      console.warn(`⚠️ [YouTube API] Data API call failed: ${err.message}`);
      metricsNote = 'YouTube API key set but request failed. Check key validity and quota.';
    }
  }

  // ── Step C: Public HTML scraper — only if API key not set and views still 0 ──
  if (!apiKey && viewsCount === 0) {
    try {
      const html = await getHttps(`https://www.youtube.com/watch?v=${videoId}`, {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept-Language': 'en-US,en;q=0.9'
      }, 8000);

      const viewMatch =
        html.match(/itemprop="interactionCount"\s+content="(\d+)"/i) ||
        html.match(/"viewCount":"(\d+)"/i);
      if (viewMatch) viewsCount = parseInt(viewMatch[1], 10);

      const likeMatch = html.match(/"defaultText":\{"accessibility":\{"accessibilityData":\{"label":"([\d,]+) likes"\}\}\}/i);
      if (likeMatch) likesCount = parseInt(likeMatch[1].replace(/,/g, ''), 10);

      hasAdDisclosure = html.toLowerCase().includes('#ad') || html.toLowerCase().includes('paid promotion');

      if (viewsCount > 0) {
        metricsSource = 'public_scrape';
        console.log(`📊 [YouTube Scraper] ${videoId}: ${viewsCount.toLocaleString()} views`);
      } else {
        metricsNote = 'Public scraper returned 0 views — Render datacenter IP may be blocked by YouTube. Add YOUTUBE_API_KEY to get real metrics.';
        console.warn(`⚠️ [YouTube Scraper] 0 views for ${videoId} — datacenter IP likely blocked`);
      }
    } catch {
      metricsNote = 'Could not fetch public metrics. Add YOUTUBE_API_KEY to Render environment for reliable real-time data.';
    }
  }

  // ── NO fake/simulated fallback — real 0 is better than fabricated numbers ──
  if (viewsCount === 0 && !metricsNote) {
    if (!apiKey) {
      metricsNote = 'Set YOUTUBE_API_KEY in Render environment for real views, likes, and comment counts.';
    }
  }

  return {
    platform: 'youtube',
    contentId: videoId,
    title:      title || 'YouTube Video',
    authorName: authorName || 'YouTube Creator',
    authorUrl,
    thumbnailUrl,
    embedUrl,
    viewsCount,
    likesCount,
    commentsCount,
    hasAdDisclosure,
    publishedAt,
    metricsSource,
    metricsNote
  };
}

/**
 * Instagram Integration:
 * - Step A: Open Graph crawler (facebookexternalhit UA) → title, thumbnail, likes, comments
 * - If blocked by Meta's datacenter firewall: returns 0 counts — NO fake data
 */
export async function getInstagramMediaDetails(url: string): Promise<MediaDetails> {
  const shortcode = parseInstagramShortcode(url);
  if (!shortcode) {
    throw new Error('Invalid Instagram link. Please paste a valid Instagram Reel or post link (e.g. instagram.com/reel/...).');
  }

  const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed`;
  let title = 'Instagram Reel';
  let authorName = 'Instagram Creator';
  let thumbnailUrl = '';
  let viewsCount = 0;
  let likesCount = 0;
  let commentsCount = 0;
  let hasAdDisclosure = false;
  let metricsSource: MediaDetails['metricsSource'] = 'unavailable';
  let metricsNote: string | undefined;

  // ── Step A: Open Graph crawler ──
  try {
    const html = await getHttps(`https://www.instagram.com/reel/${shortcode}/`, {
      'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      'Accept': 'text/html,application/xhtml+xml'
    });

    const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i);
    if (titleMatch) title = titleMatch[1];

    const imageMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
    if (imageMatch) thumbnailUrl = imageMatch[1];

    const descMatch = html.match(/property="og:description"\s+content="([^"]+)"/i);
    if (descMatch) {
      const content = descMatch[1];

      const likesMatch = content.match(/([\d.,]+)([KkMm]?)\s+likes/i);
      if (likesMatch) {
        let val = parseFloat(likesMatch[1].replace(/,/g, ''));
        const unit = likesMatch[2].toUpperCase();
        if (unit === 'K') val *= 1000;
        if (unit === 'M') val *= 1000000;
        likesCount = Math.round(val);
      }

      const commentsMatch = content.match(/([\d.,]+)([KkMm]?)\s+comments/i);
      if (commentsMatch) {
        let val = parseFloat(commentsMatch[1].replace(/,/g, ''));
        const unit = commentsMatch[2].toUpperCase();
        if (unit === 'K') val *= 1000;
        if (unit === 'M') val *= 1000000;
        commentsCount = Math.round(val);
      }

      hasAdDisclosure = content.toLowerCase().includes('#ad') || content.toLowerCase().includes('paid partnership');
    }

    if (likesCount > 0 || title !== 'Instagram Reel') {
      metricsSource = 'public_scrape';
      console.log(`✅ [Instagram OG] ${shortcode}: ${likesCount.toLocaleString()} likes`);
    } else {
      metricsNote = 'Instagram returned a page but no metrics found — Meta may be blocking datacenter IPs. Metrics will show 0 until a user-facing proxy or Meta Graph API token is configured.';
      console.warn(`⚠️ [Instagram OG] No metrics for ${shortcode} — possible IP block`);
    }
  } catch (err: any) {
    metricsNote = 'Could not reach Instagram. Meta blocks most datacenter IPs. The embed player still works for display.';
    console.warn(`⚠️ [Instagram OG] Fetch error for ${shortcode}: ${err.message}`);
  }

  // ── NO fake/simulated fallback ──
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
    metricsSource,
    metricsNote
  };
}
