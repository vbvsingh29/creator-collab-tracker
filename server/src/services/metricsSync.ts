import https from 'https';
import { db } from '../db/database';

// Extract YouTube Video ID from standard, short, or Shorts URLs
export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

// Extract Instagram Reel/Post Shortcode
export function extractInstagramCode(url: string): string | null {
  const match = url.match(/(?:instagram\.com\/(?:p|reel|tv)\/)([\w-]+)/);
  return match ? match[1] : null;
}

function fetchHttps(url: string, headers: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Fetch YouTube statistics (views & likes)
 * Uses YouTube Data API v3 if YOUTUBE_API_KEY is configured in .env,
 * or parses public interaction metadata.
 */
export async function syncYouTubeMetrics(url: string): Promise<{ views: number; likes: number }> {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL format');
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`;
      const response = await fetchHttps(apiUrl);
      const json = JSON.parse(response);

      if (json.items && json.items.length > 0) {
        const stats = json.items[0].statistics;
        return {
          views: parseInt(stats.viewCount || '0', 10),
          likes: parseInt(stats.likeCount || '0', 10),
        };
      }
    } catch (err: any) {
      console.warn('YouTube API error, falling back to public extraction:', err.message);
    }
  }

  // Fallback: Fetch public video page and parse interaction metadata
  try {
    const html = await fetchHttps(`https://www.youtube.com/watch?v=${videoId}`, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    // Look for <meta itemprop="interactionCount" content="84200">
    const viewMatch = html.match(/itemprop="interactionCount"\s+content="(\d+)"/i) ||
                      html.match(/"viewCount":"(\d+)"/i);
    const likeMatch = html.match(/"defaultText":\{"accessibility":\{"accessibilityData":\{"label":"([\d,]+) likes"\}\}\}/i) ||
                      html.match(/"likeCount":"(\d+)"/i);

    const views = viewMatch ? parseInt(viewMatch[1], 10) : 0;
    const likes = likeMatch ? parseInt(likeMatch[1].replace(/,/g, ''), 10) : 0;

    return { views, likes };
  } catch (err: any) {
    console.warn('Public YouTube extraction error:', err.message);
    return { views: 0, likes: 0 };
  }
}

/**
 * Fetch Instagram Reel statistics
 * Supports Instagram Graph API with INSTAGRAM_ACCESS_TOKEN or Open Graph crawler inspection
 */
export async function syncInstagramMetrics(url: string): Promise<{ views: number; likes: number }> {
  const shortcode = extractInstagramCode(url);
  if (!shortcode) {
    throw new Error('Invalid Instagram Reel URL format');
  }

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (accessToken) {
    try {
      const apiUrl = `https://graph.facebook.com/v19.0/${shortcode}?fields=like_count,comments_count&access_token=${accessToken}`;
      const response = await fetchHttps(apiUrl);
      const json = JSON.parse(response);
      return {
        views: 0, // In Graph API, views are obtained via /insights endpoint
        likes: parseInt(json.like_count || '0', 10),
      };
    } catch (err: any) {
      console.warn('Instagram Graph API error:', err.message);
    }
  }

  // Fallback: Fetch page with crawler User-Agent to read Open Graph description
  try {
    const html = await fetchHttps(`https://www.instagram.com/reel/${shortcode}/`, {
      'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
    });

    // Example og:description: "24K likes, 412 comments - Creator on Instagram: ..."
    const descMatch = html.match(/property="og:description"\s+content="([^"]+)"/i);
    if (descMatch) {
      const content = descMatch[1];
      const likesMatch = content.match(/([\d.,]+)([KkMm]?)\s+likes/i);
      let likes = 0;
      if (likesMatch) {
        let val = parseFloat(likesMatch[1]);
        const unit = likesMatch[2].toUpperCase();
        if (unit === 'K') val *= 1000;
        if (unit === 'M') val *= 1000000;
        likes = Math.round(val);
      }
      return { views: 0, likes };
    }
  } catch (err: any) {
    console.warn('Instagram Open Graph extraction error:', err.message);
  }

  return { views: 0, likes: 0 };
}
