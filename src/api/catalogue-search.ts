/**
 * NLB Catalogue Search API Routes
 * Handles /api/catalogue/* endpoints
 *
 * Agent: N/A (utility API, not an AI agent)
 * Model: N/A
 * Called from: client-side BookCoverManager (future integration)
 */

import { Router } from 'express';
import https from 'https';
import crypto from 'crypto';

const router = Router();

interface CatalogueSearchOptions {
  size?: number;
  contentType?: string;
  language?: string;
}

interface FormattedResult {
  contentId: string;
  title: string;
  author: string;
  contentType: string;
  language: string;
  coverUrl: string | null;
  availableAtBishan: boolean;
  rank: number;
}

interface CatalogueResponse {
  success: boolean;
  message: string;
  results: FormattedResult[];
  query?: string;
}

const API_TOKEN = process.env.NLB_CATALOGUE_API_TOKEN || '';
const TENANT_ID = '3000086253';
const BRANCH = 'BIPL';
const API_URL = 'https://rec-api-sg1.recplusapi.com/sg2/ContentSaaS/Predict';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function makeRequest(body: object, headers: Record<string, string>): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const url = new URL(API_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(postData).toString()
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: string) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode || 500, body: data });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function formatResponse(apiResponse: { status: number; body: string }, query: string): CatalogueResponse {
  try {
    const data = JSON.parse(apiResponse.body);

    if (!data.status?.success) {
      return { success: false, message: 'Search was not successful', results: [] };
    }

    const results = data.content_value?.response_contents || [];

    if (results.length === 0) {
      return { success: true, message: `No results found for "${query}"`, results: [] };
    }

    const formattedResults: FormattedResult[] = results.map((item: Record<string, unknown>) => {
      const extra = (item.extra || {}) as Record<string, string>;

      let coverUrl: string | null = null;
      try {
        const imageUrls = JSON.parse(extra.image_urls || '[]');
        coverUrl = imageUrls.length > 0 ? imageUrls[0] : null;
      } catch {
        // Parse error - no cover
      }

      let availableAtBishan = false;
      try {
        const branches = JSON.parse(extra.branch || '[]');
        availableAtBishan = branches.includes('BIPL') || branches.includes('Bishan');
      } catch {
        // Parse error - unknown availability
      }

      return {
        contentId: extra.content_id || 'Unknown',
        title: (extra.content_title || 'Unknown Title').trim(),
        author: extra.content_owner_id || 'Unknown Author',
        contentType: extra.content_type || 'Book',
        language: extra.language || 'English',
        coverUrl,
        availableAtBishan,
        rank: (item.rank as number) || 0
      };
    });

    const resultCount = formattedResults.length;
    const responseMessage = `Found ${resultCount} result${resultCount !== 1 ? 's' : ''} for "${query}"`;

    return {
      success: true,
      message: responseMessage,
      results: formattedResults,
      query
    };

  } catch (error) {
    console.error('Error formatting catalogue response:', error);
    return { success: false, message: 'Error processing search results', results: [] };
  }
}

async function searchCatalogue(query: string, options: CatalogueSearchOptions = {}): Promise<CatalogueResponse> {
  const { size = 3, contentType = 'Book', language = 'English' } = options;

  if (!API_TOKEN) {
    return { success: false, message: 'NLB API token not configured', results: [] };
  }

  const body = {
    project_id: 'nlb',
    model_id: 'econcierge_search',
    user_id: '0',
    size: size.toString(),
    scene: { page_number: '1' },
    extra: {
      query,
      search_fields: 'goods_title goods_author_id goods_cate',
      enable_language_filter: 'true',
      language,
      enable_content_type_filter: 'true',
      content_type: contentType,
      enable_branch_filter: 'true',
      branch: BRANCH,
      enable_new_publish_day_filter: 'false',
      new_publish_day: '365',
      enable_audience_filter: 'false',
      enable_cate_filter: 'false',
      sort_mode: 'relevance_asc'
    }
  };

  const tenantTs = Math.floor(Date.now() / 1000).toString();
  const tenantNonce = tenantTs;
  const httpBody = JSON.stringify(body);
  const message = API_TOKEN + httpBody + TENANT_ID + tenantTs + tenantNonce;
  const signature = crypto.createHash('sha256').update(message).digest('hex');

  const headers: Record<string, string> = {
    'Tenant-Id': TENANT_ID,
    'Request-Id': generateUUID(),
    'accept': 'application/json',
    'content-type': 'application/json',
    'Tenant-Ts': tenantTs,
    'Tenant-Nonce': tenantNonce,
    'Tenant-Signature': signature
  };

  const response = await makeRequest(body, headers);
  return formatResponse(response, query);
}

/**
 * POST /api/catalogue/search
 * Search NLB catalogue for books
 */
router.post('/search', async (req, res) => {
  try {
    const { query, size, contentType, language } = req.body;

    if (!query) {
      res.status(400).json({ success: false, message: 'Query is required', results: [] });
      return;
    }

    const result = await searchCatalogue(query, { size, contentType, language });
    res.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Catalogue search error:', err.message);
    res.status(500).json({ success: false, message: 'Search failed', results: [] });
  }
});

/**
 * GET /api/catalogue/health
 * Health check for catalogue API
 */
router.get('/health', (_req, res) => {
  res.json({
    status: API_TOKEN ? 'configured' : 'missing_token',
    timestamp: new Date().toISOString()
  });
});

export default router;
