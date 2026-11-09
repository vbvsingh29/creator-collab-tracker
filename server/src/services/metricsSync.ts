import https from 'https';

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
export async function syncInstagramMetrics(
  url: string,
  userToken?: string,
  userAccountId?: string
): Promise<{ views: number; likes: number }> {
  const { getInstagramMediaDetails } = require('./mediaIntegrations');
  try {
    const details = await getInstagramMediaDetails(url, userToken, userAccountId);
    return {
      views: details.viewsCount || 0,
      likes: details.likesCount || 0
    };
  } catch (err: any) {
    console.warn('Instagram metrics sync error:', err.message);
    return { views: 0, likes: 0 };
  }
}
