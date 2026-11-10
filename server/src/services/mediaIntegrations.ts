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

/**
 * Robust HTML entity decoder: decodes named, decimal, and hex entities
 * like &quot;, &#x2019;, &#x20b9;, &#064;, &amp; into normal characters.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2019;/g, "’")
    .replace(/&#8217;/g, "’")
    .replace(/&#x2018;/g, "‘")
    .replace(/&#8216;/g, "‘")
    .replace(/&#x201c;/g, '“')
    .replace(/&#8220;/g, '“')
    .replace(/&#x201d;/g, '”')
    .replace(/&#8221;/g, '”')
    .replace(/&#x20b9;/g, '₹')
    .replace(/&#8377;/g, '₹')
    .replace(/&#064;/g, '@')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return _;
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return _;
      }
    });
}

// Helper to make HTTPS GET requests with status code validation and redirect following
export function getHttps(url: string, headers: Record<string, string> = {}, timeoutMs = 7000): Promise<string> {
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

      const pubMatch = html.match(/itemprop="datePublished"\s+content="([^"]+)"/i) ||
                        html.match(/"publishDate":"([^"]+)"/i) ||
                        html.match(/"uploadDate":"([^"]+)"/i);
      if (pubMatch && !publishedAt) {
        publishedAt = pubMatch[1];
      }

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
    title:      decodeHtmlEntities(title || 'YouTube Video'),
    authorName: decodeHtmlEntities(authorName || 'YouTube Creator'),
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
 * Query Meta Graph API for real lifetime media insights:
 * Supports:
 * - Direct Media ID lookup (if media_id is known or resolved from account media list)
 * - Automatic resolution from shortcode using Instagram Business/Creator account media list
 * - Lifetime Insights: GET /{media_id}/insights?metric=views,reach,plays,total_interactions,saved,shares&period=lifetime
 * - Official oEmbed verification: GET /instagram_oembed?url={url}&access_token={token}
 */
export async function getInstagramGraphApiDetails(
  url: string,
  shortcode: string,
  accessToken: string,
  accountId?: string
): Promise<MediaDetails | null> {
  try {
    const apiVersion = 'v21.0';
    let targetMediaId: string | null = null;
    let targetMediaData: any = null;

    // Step 1: Discover or verify the Instagram Business / Creator Account ID if not provided
    let effectiveAccountId = accountId;
    if (!effectiveAccountId) {
      try {
        const meRes = await getHttps(`https://graph.facebook.com/${apiVersion}/me/accounts?fields=instagram_business_account{id,username,name}&access_token=${accessToken}`);
        const meJson = JSON.parse(meRes);
        if (meJson.data && Array.isArray(meJson.data)) {
          for (const page of meJson.data) {
            if (page.instagram_business_account?.id) {
              effectiveAccountId = page.instagram_business_account.id;
              break;
            }
          }
        }
      } catch (err: any) {
        console.warn('[Meta Graph API] Could not auto-detect account from /me/accounts:', err.message);
      }
    }

    if (!effectiveAccountId) {
      try {
        const meUserRes = await getHttps(`https://graph.facebook.com/${apiVersion}/me?fields=id,username&access_token=${accessToken}`);
        const meUserJson = JSON.parse(meUserRes);
        if (meUserJson.id) {
          effectiveAccountId = meUserJson.id;
        }
      } catch {}
    }

    // Step 2: Search for media matching shortcode in account's recent media
    if (effectiveAccountId) {
      try {
        const mediaListRes = await getHttps(
          `https://graph.facebook.com/${apiVersion}/${effectiveAccountId}/media?fields=id,shortcode,permalink,caption,media_type,media_product_type,like_count,comments_count,timestamp,thumbnail_url,media_url&limit=50&access_token=${accessToken}`
        );
        const mediaListJson = JSON.parse(mediaListRes);
        if (mediaListJson.data && Array.isArray(mediaListJson.data)) {
          for (const m of mediaListJson.data) {
            if (m.shortcode === shortcode || (m.permalink && m.permalink.includes(shortcode))) {
              targetMediaId = m.id;
              targetMediaData = m;
              break;
            }
          }
        }
      } catch (err: any) {
        console.warn(`[Meta Graph API] Media search error on account ${effectiveAccountId}:`, err.message);
      }
    }

    // Step 3: If target media found, query REAL LIFETIME INSIGHTS
    let lifetimeViews = 0;
    let lifetimeReach = 0;
    let lifetimeLikes = targetMediaData?.like_count ? parseInt(targetMediaData.like_count, 10) : 0;
    let lifetimeComments = targetMediaData?.comments_count ? parseInt(targetMediaData.comments_count, 10) : 0;
    let caption = targetMediaData?.caption || '';
    let author = targetMediaData?.username || 'Instagram Creator';
    let thumb = targetMediaData?.thumbnail_url || targetMediaData?.media_url || '';
    let publishedAt = targetMediaData?.timestamp || '';

    if (targetMediaId) {
      try {
        // Query lifetime insights for Reels / Videos
        const insightsRes = await getHttps(
          `https://graph.facebook.com/${apiVersion}/${targetMediaId}/insights?metric=views,reach,plays,total_interactions,saved,shares&period=lifetime&access_token=${accessToken}`
        );
        const insightsJson = JSON.parse(insightsRes);
        if (insightsJson.data && Array.isArray(insightsJson.data)) {
          for (const metric of insightsJson.data) {
            const val = metric.values?.[0]?.value ?? 0;
            if (metric.name === 'views' && val > 0) lifetimeViews = val;
            if (metric.name === 'plays' && val > 0 && lifetimeViews === 0) lifetimeViews = val;
            if (metric.name === 'reach' && val > 0) lifetimeReach = val;
          }
        }
      } catch (err: any) {
        console.warn(`[Meta Graph API] Insights error for media ${targetMediaId}:`, err.message);
        // Fallback for regular image/carousel posts: metric=impressions,reach,saved,total_interactions
        try {
          const fallbackInsightsRes = await getHttps(
            `https://graph.facebook.com/${apiVersion}/${targetMediaId}/insights?metric=impressions,reach,saved,total_interactions&period=lifetime&access_token=${accessToken}`
          );
          const fallbackJson = JSON.parse(fallbackInsightsRes);
          if (fallbackJson.data && Array.isArray(fallbackJson.data)) {
            for (const metric of fallbackJson.data) {
              const val = metric.values?.[0]?.value ?? 0;
              if (metric.name === 'impressions' && val > 0) lifetimeViews = val;
              if (metric.name === 'reach' && val > 0) lifetimeReach = val;
            }
          }
        } catch {}
      }

      return {
        platform: 'instagram',
        contentId: shortcode,
        title: caption ? decodeHtmlEntities(caption) : 'Instagram Reel',
        authorName: author,
        thumbnailUrl: thumb,
        embedUrl: `https://www.instagram.com/reel/${shortcode}/embed`,
        viewsCount: lifetimeViews,
        likesCount: lifetimeLikes,
        commentsCount: lifetimeComments,
        hasAdDisclosure: caption.toLowerCase().includes('#ad') || caption.toLowerCase().includes('paid partnership'),
        publishedAt,
        metricsSource: 'official_api',
        metricsNote: `Verified real lifetime data via Meta Graph API (${lifetimeViews.toLocaleString()} views, ${lifetimeReach.toLocaleString()} reach)`
      };
    }

    return null;
  } catch (err: any) {
    console.warn('[Meta Graph API] Error:', err.message);
    return null;
  }
}

/**
 * Instagram Integration:
 * - Priority 1: Meta Graph API (Official Lifetime Views, Reach & Plays) if access token available
 * - Priority 2: Open Graph crawler (facebookexternalhit UA) → title, thumbnail, likes, comments
 */
export async function getInstagramMediaDetails(
  url: string,
  userToken?: string,
  userAccountId?: string
): Promise<MediaDetails> {
  const shortcode = parseInstagramShortcode(url);
  if (!shortcode) {
    throw new Error('Invalid Instagram link. Please paste a valid Instagram Reel or post link (e.g. instagram.com/reel/...).');
  }

  // Priority 1: Check Meta Graph API for official real lifetime data
  const metaToken = (userToken && userToken.trim()) || (process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_ACCESS_TOKEN.trim());
  const metaAccountId = (userAccountId && userAccountId.trim()) || (process.env.INSTAGRAM_ACCOUNT_ID && process.env.INSTAGRAM_ACCOUNT_ID.trim());

  if (metaToken) {
    try {
      const graphData = await getInstagramGraphApiDetails(url, shortcode, metaToken, metaAccountId);
      if (graphData && (graphData.viewsCount > 0 || graphData.likesCount > 0)) {
        console.log(`✅ [Meta Graph API] Synced lifetime data for ${shortcode}: ${graphData.viewsCount} views, ${graphData.likesCount} likes`);
        return graphData;
      }
    } catch (err: any) {
      console.warn(`[Meta Graph API] Fallback to Open Graph scraper: ${err.message}`);
    }
  }

  const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed`;
  let title = 'Instagram Reel';
  let authorName = 'Instagram Creator';
  let thumbnailUrl = '';
  let viewsCount = 0;
  let likesCount = 0;
  let commentsCount = 0;
  let hasAdDisclosure = false;
  let publishedAt = '';
  let metricsSource: MediaDetails['metricsSource'] = 'unavailable';
  let metricsNote: string | undefined;

  // ── Step A: Open Graph crawler ──
  try {
    const html = await getHttps(`https://www.instagram.com/reel/${shortcode}/`, {
      'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      'Accept': 'text/html,application/xhtml+xml'
    });

    const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i);
    if (titleMatch) {
      const decodedRaw = decodeHtmlEntities(titleMatch[1]);
      // Extract author if formatted as "Author Name on Instagram: ..."
      const authorMatch = decodedRaw.match(/^([^:]+)\s+on Instagram/i);
      if (authorMatch && authorMatch[1].trim()) {
        authorName = authorMatch[1].trim();
      }

      // If title is "Author on Instagram: \"Caption\"", extract just the clean caption
      const quoteMatch = decodedRaw.match(/on Instagram:\s*["“](.*?)["”]?\s*$/s);
      if (quoteMatch && quoteMatch[1].trim()) {
        title = quoteMatch[1].trim();
      } else {
        title = decodedRaw;
      }
      // Clean trailing hashtags and excess whitespace
      title = title.replace(/#\w+/g, '').replace(/\s+/g, ' ').trim();
    }

    const imageMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
    if (imageMatch) thumbnailUrl = imageMatch[1];

    const descMatch = html.match(/property="og:description"\s+content="([^"]+)"/i);
    if (descMatch) {
      const content = decodeHtmlEntities(descMatch[1]);

      // Extract date from description e.g. "... - @alpha.omega209 on November 6, 2026"
      const dateMatch = content.match(/\bon\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i) ||
                        content.match(/\bon\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i);
      if (dateMatch) {
        try {
          const parsed = new Date(dateMatch[1]);
          if (!isNaN(parsed.getTime())) {
            publishedAt = parsed.toISOString();
          }
        } catch {}
      }

      // Check author handle like "@alpha.omega209"
      const handleMatch = content.match(/@([a-zA-Z0-9._]+)/);
      if (handleMatch && (!authorName || authorName === 'Instagram Creator')) {
        authorName = `@${handleMatch[1]}`;
      }

      const likesMatch = content.match(/([\d.,]+)([KkMm]?)\s+likes/i) ||
                         html.match(/([\d.,]+)([KkMm]?)\s+likes/i);
      if (likesMatch) {
        let val = parseFloat(likesMatch[1].replace(/,/g, ''));
        const unit = (likesMatch[2] || '').toUpperCase();
        if (unit === 'K') val *= 1000;
        if (unit === 'M') val *= 1000000;
        likesCount = Math.round(val);
      }

      const viewsMatch = content.match(/([\d.,]+)([KkMm]?)\s+(?:views|plays|video views)/i) ||
                         html.match(/([\d.,]+)([KkMm]?)\s+(?:views|plays)\b/i);
      if (viewsMatch) {
        let val = parseFloat(viewsMatch[1].replace(/,/g, ''));
        const unit = (viewsMatch[2] || '').toUpperCase();
        if (unit === 'K') val *= 1000;
        if (unit === 'M') val *= 1000000;
        viewsCount = Math.round(val);
      }

      const commentsMatch = content.match(/([\d.,]+)([KkMm]?)\s+comments/i) ||
                            html.match(/([\d.,]+)([KkMm]?)\s+comments/i);
      if (commentsMatch) {
        let val = parseFloat(commentsMatch[1].replace(/,/g, ''));
        const unit = (commentsMatch[2] || '').toUpperCase();
        if (unit === 'K') val *= 1000;
        if (unit === 'M') val *= 1000000;
        commentsCount = Math.round(val);
      }

      hasAdDisclosure = content.toLowerCase().includes('#ad') || content.toLowerCase().includes('paid partnership');
    }

    if (viewsCount === 0) {
      const jsonViewMatch = html.match(/"(?:video_view_count|video_play_count|play_count|view_count)":\s*(\d+)/i);
      if (jsonViewMatch) {
        viewsCount = parseInt(jsonViewMatch[1], 10);
      }
    }

    if (!publishedAt) {
      const pubMatch = html.match(/"uploadDate":"([^"]+)"/i) ||
                       html.match(/property="article:published_time"\s+content="([^"]+)"/i) ||
                       html.match(/property="og:updated_time"\s+content="([^"]+)"/i);
      if (pubMatch) {
        publishedAt = pubMatch[1];
      }
    }

    if (likesCount > 0 || title !== 'Instagram Reel') {
      metricsSource = 'public_scrape';
      console.log(`✅ [Instagram OG] ${shortcode}: ${likesCount.toLocaleString()} likes`);
    } else {
      metricsNote = 'Instagram returned a page but no metrics found — Meta may be blocking datacenter IPs. Connect your Meta Graph API token in Integrations for automatic real lifetime insights, or enter views manually.';
      console.warn(`⚠️ [Instagram OG] No metrics for ${shortcode} — possible IP block`);
    }
  } catch (err: any) {
    metricsNote = 'Could not reach Instagram. Meta blocks most datacenter IPs. Connect Meta Graph API in Integrations for automatic lifetime sync.';
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
    publishedAt,
    metricsSource,
    metricsNote
  };
}
