import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'node:path';
import type {
  DualSeoConfigRecord,
  DualSeoGenerateInput,
} from './src/types/dualSeo.ts';
import {
  buildDualSeoClientJsPayload,
  buildEmbedScriptSnippet,
  buildPartnerJsonLd,
  isPublicExternalUrl,
  sanitizeSafeHttpUrl,
  slugifyPartnerId,
  validateDualSeoGenerateInput,
} from './src/utils/dualSeo.ts';
import {
  getSchemaSqlText,
  getSeoConfigByPartnerId,
  getSeoDatabase,
  listSeoConfigs,
  patchSeoConfigMeta,
  recordExternalScriptPing,
  setExternalSyncVerification,
  updateDualIndexingReceipts,
  upsertSeoConfig,
} from './server/seoDatabase.ts';
import {
  GeminiSeoError,
  generateSeoWithGemini,
} from './server/geminiSeoAgent.ts';
import { triggerDualIndexing } from './server/indexingWorker.ts';

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

function resolveRequestOrigin(req: Request): string {
  const host =
    (req.headers['x-forwarded-host'] as string | undefined)?.split(',')[0]?.trim() ||
    req.get('host');
  const proto =
    (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim() ||
    req.protocol ||
    'http';
  if (host) {
    return `${proto}://${host}`;
  }
  const configured = process.env.APP_URL?.trim();
  if (configured && configured !== 'MY_APP_URL') {
    return configured.replace(/\/+$/, '');
  }
  return `http://localhost:${PORT}`;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function startServer() {
  // Initialize SQLite database & seed initial partner records
  getSeoDatabase();

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));

  // Health & SQL schema inspector
  app.get('/api/seo/schema-sql', (_req: Request, res: Response) => {
    res.json({
      table: 'partners_seo_configs',
      sql: getSchemaSqlText(),
    });
  });

  // List all Dual-SEO partner configs
  app.get('/api/seo/configs', (req: Request, res: Response) => {
    const origin = resolveRequestOrigin(req);
    const configs = listSeoConfigs();
    res.json({
      apiOrigin: origin,
      configs,
    });
  });

  // Get single Dual-SEO partner config
  app.get('/api/seo/configs/:partnerId', (req: Request, res: Response) => {
    const partnerId = String(req.params.partnerId || '').trim();
    const record = getSeoConfigByPartnerId(partnerId);
    if (!record) {
      res.status(404).json({ error: 'Partner Dual-SEO config not found.' });
      return;
    }
    const origin = resolveRequestOrigin(req);
    res.json({
      config: record,
      scriptSnippet: buildEmbedScriptSnippet(origin, record.partnerId),
    });
  });

  // Update anchor rotation index, Pro status, or external URL
  app.patch('/api/seo/configs/:partnerId', (req: Request, res: Response) => {
    const partnerId = String(req.params.partnerId || '').trim();
    const body = (req.body ?? {}) as {
      external_website_url?: string;
      is_pro_partner?: boolean;
      active_anchor_index?: number;
    };

    let cleanExternalUrl: string | undefined;
    if (typeof body.external_website_url === 'string') {
      const checked = sanitizeSafeHttpUrl(body.external_website_url);
      if (!checked) {
        res.status(400).json({
          error: 'external_website_url must be a valid http:// or https:// URL.',
        });
        return;
      }
      cleanExternalUrl = checked;
    }

    const updated = patchSeoConfigMeta(partnerId, {
      externalWebsiteUrl: cleanExternalUrl,
      isProPartner:
        typeof body.is_pro_partner === 'boolean' ? body.is_pro_partner : undefined,
      activeAnchorIndex:
        typeof body.active_anchor_index === 'number' &&
        Number.isFinite(body.active_anchor_index)
          ? Math.max(0, Math.floor(body.active_anchor_index))
          : undefined,
    });

    if (!updated) {
      res.status(404).json({ error: 'Partner Dual-SEO config not found.' });
      return;
    }

    res.json({ config: updated });
  });

  // MODULE 1 + MODULE 4: POST /api/seo/generate
  app.post('/api/seo/generate', async (req: Request, res: Response) => {
    const input = (req.body ?? {}) as Partial<DualSeoGenerateInput>;
    const validation = validateDualSeoGenerateInput(input);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const cleanInput: DualSeoGenerateInput = {
      partner_id: input.partner_id?.trim() || slugifyPartnerId(input.business_name!),
      business_name: input.business_name!.trim(),
      category: input.category!,
      location: input.location!.trim(),
      raw_keywords: (input.raw_keywords ?? '').trim(),
      description: (input.description ?? '').trim(),
      price_range: (input.price_range ?? '').trim(),
      offers: (input.offers ?? '').trim(),
      external_website_url: sanitizeSafeHttpUrl(input.external_website_url!)!,
      internal_listing_url: input.internal_listing_url?.trim(),
      is_pro_partner: Boolean(input.is_pro_partner),
    };

    const origin = resolveRequestOrigin(req);
    const partnerId = cleanInput.partner_id!;
    const internalListingUrl =
      sanitizeSafeHttpUrl(cleanInput.internal_listing_url ?? '') ??
      `${origin}/?listing=${encodeURIComponent(partnerId)}`;

    try {
      const generated = await generateSeoWithGemini(cleanInput);
      const jsonLdSchema = buildPartnerJsonLd({
        businessName: cleanInput.business_name,
        category: cleanInput.category,
        location: cleanInput.location,
        description: cleanInput.description || generated.metaDescription,
        priceRange: cleanInput.price_range,
        offers: cleanInput.offers,
        externalWebsiteUrl: cleanInput.external_website_url,
        internalListingUrl,
        faqs: generated.faqs,
      });

      const existing = getSeoConfigByPartnerId(partnerId);
      const nowIso = new Date().toISOString();

      const draftRecord: DualSeoConfigRecord = {
        partnerId,
        businessName: cleanInput.business_name,
        category: cleanInput.category,
        location: cleanInput.location,
        rawKeywords: cleanInput.raw_keywords,
        description: cleanInput.description,
        priceRange: cleanInput.price_range,
        offers: cleanInput.offers,
        internalListingUrl,
        externalWebsiteUrl: cleanInput.external_website_url,
        metaTitle: generated.metaTitle,
        metaDescription: generated.metaDescription,
        longTailKeywords: generated.longTailKeywords,
        faqs: generated.faqs,
        jsonLdSchema,
        anchorTextVariants: generated.anchorTextVariants,
        activeAnchorIndex: existing?.activeAnchorIndex ?? 0,
        isProPartner:
          typeof input.is_pro_partner === 'boolean'
            ? input.is_pro_partner
            : existing?.isProPartner ?? true,
        internalIndexStatus: 'Indexed',
        internalIndexedAt: nowIso,
        externalSyncStatus: existing?.externalSyncStatus ?? 'not_connected',
        externalSyncVerifiedAt: existing?.externalSyncVerifiedAt ?? null,
        externalScriptPings: existing?.externalScriptPings ?? 0,
        lastSyncOrigin: existing?.lastSyncOrigin ?? null,
        externalIndexStatus: existing?.externalIndexStatus ?? 'Pending',
        externalIndexedAt: existing?.externalIndexedAt ?? null,
        lastIndexingReceipts: existing?.lastIndexingReceipts ?? [],
        createdAt: existing?.createdAt ?? nowIso,
        updatedAt: nowIso,
      };

      const saved = upsertSeoConfig(draftRecord);

      // Module 4: Automatically trigger Dual Google Indexing API (URL_UPDATED)
      const indexingReceipts = await triggerDualIndexing(
        saved.internalListingUrl,
        saved.externalWebsiteUrl
      );
      const finalized = updateDualIndexingReceipts(saved.partnerId, indexingReceipts)!;

      res.json({
        config: finalized,
        scriptSnippet: buildEmbedScriptSnippet(origin, finalized.partnerId),
        indexingReceipts,
      });
    } catch (err) {
      if (err instanceof GeminiSeoError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({
        error:
          err instanceof Error
            ? err.message
            : 'Unexpected error generating Dual-SEO configuration.',
      });
    }
  });

  // MODULE 2: 1-Line Plug-and-Play External Website SEO Sync Script
  app.get('/v1/dual-seo.js', (req: Request, res: Response) => {
    const partnerId = String(req.query.partner_id || '').trim();
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

    if (!partnerId) {
      res
        .status(400)
        .send('/* WayanadStays Dual-SEO Error: Missing partner_id query parameter. */');
      return;
    }

    const config = getSeoConfigByPartnerId(partnerId);
    if (!config) {
      res
        .status(404)
        .send('/* WayanadStays Dual-SEO: Partner configuration not found. */');
      return;
    }

    const origin = resolveRequestOrigin(req);
    const scriptBody = buildDualSeoClientJsPayload(config, origin);
    res.status(200).send(scriptBody);
  });

  // Beacon ping endpoint called asynchronously by dual-seo.js on external websites
  app.post(
    '/api/seo/ping',
    express.text({ type: 'text/plain', limit: '64kb' }),
    (req: Request, res: Response) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      let parsedBody: { partner_id?: string; origin?: string } = {};
      if (typeof req.body === 'string') {
        try {
          parsedBody = JSON.parse(req.body) as { partner_id?: string; origin?: string };
        } catch {
          parsedBody = {};
        }
      } else if (req.body && typeof req.body === 'object') {
        parsedBody = req.body as { partner_id?: string; origin?: string };
      }

      const partnerId = String(
        parsedBody.partner_id || req.query.partner_id || ''
      ).trim();
      const originHeader = String(
        parsedBody.origin || req.headers.origin || req.headers.referer || 'external-website'
      ).trim();

      if (!partnerId) {
        res.status(400).json({ ok: false, error: 'partner_id required' });
        return;
      }

      const updated = recordExternalScriptPing(partnerId, originHeader);
      if (!updated) {
        res.status(404).json({ ok: false, error: 'Partner config not found' });
        return;
      }

      res.json({
        ok: true,
        partnerId: updated.partnerId,
        externalSyncStatus: updated.externalSyncStatus,
        externalScriptPings: updated.externalScriptPings,
      });
    }
  );

  app.options('/api/seo/ping', (_req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
  });

  // Verify Connection ping test for Partner Dashboard
  app.post('/api/seo/verify-connection', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as {
      partner_id?: string;
      external_website_url?: string;
    };
    const partnerId = String(body.partner_id || '').trim();
    if (!partnerId) {
      res.status(400).json({ error: 'partner_id is required.' });
      return;
    }

    const existing = getSeoConfigByPartnerId(partnerId);
    if (!existing) {
      res.status(404).json({ error: 'Partner Dual-SEO config not found.' });
      return;
    }

    const targetUrl =
      body.external_website_url?.trim() || existing.externalWebsiteUrl;
    const urlCheck = isPublicExternalUrl(targetUrl);
    if (!urlCheck.safe || !urlCheck.normalized) {
      res.status(400).json({ error: urlCheck.reason });
      return;
    }

    // Save any edited external website URL first
    if (urlCheck.normalized !== existing.externalWebsiteUrl) {
      patchSeoConfigMeta(partnerId, { externalWebsiteUrl: urlCheck.normalized });
    }

    // 1. Check live script tag presence on public external URL (SSRF-guarded)
    let scriptDetectedOnPage = false;
    let fetchNote = '';

    try {
      const response = await fetch(urlCheck.normalized, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'WayanadStays-DualSEO-Verifier/1.0',
          Accept: 'text/html',
        },
        signal: AbortSignal.timeout(4500),
      });
      if (response.ok) {
        const html = await response.text();
        if (
          html.includes('/v1/dual-seo.js') &&
          html.includes(encodeURIComponent(partnerId))
        ) {
          scriptDetectedOnPage = true;
        } else {
          fetchNote = 'Remote HTML responded, but the dual-seo.js script tag was not found in <head>.';
        }
      } else {
        fetchNote = `Remote site returned HTTP ${response.status}.`;
      }
    } catch {
      fetchNote = 'Could not reach external host directly.';
    }

    const latest = getSeoConfigByPartnerId(partnerId)!;

    if (scriptDetectedOnPage) {
      const updated = setExternalSyncVerification(
        partnerId,
        true,
        urlCheck.normalized
      )!;
      res.json({
        partnerId,
        connected: true,
        externalSyncStatus: updated.externalSyncStatus,
        externalWebsiteUrl: updated.externalWebsiteUrl,
        method: 'script_tag_detected',
        externalScriptPings: updated.externalScriptPings,
        verifiedAt: updated.externalSyncVerifiedAt,
        message: `Verified! Detected dual-seo.js tag on ${urlCheck.normalized}.`,
      });
      return;
    }

    // 2. Fallback to live script beacon telemetry if external site loaded the script
    if (latest.externalScriptPings > 0 && latest.externalSyncStatus === 'connected') {
      res.json({
        partnerId,
        connected: true,
        externalSyncStatus: latest.externalSyncStatus,
        externalWebsiteUrl: latest.externalWebsiteUrl,
        method: 'live_beacon_verified',
        externalScriptPings: latest.externalScriptPings,
        verifiedAt: latest.externalSyncVerifiedAt,
        message: `Live script beacon active (${latest.externalScriptPings} ping(s) received from ${
          latest.lastSyncOrigin || 'partner site'
        }).`,
      });
      return;
    }

    const updated = setExternalSyncVerification(partnerId, false, urlCheck.normalized)!;
    res.json({
      partnerId,
      connected: false,
      externalSyncStatus: updated.externalSyncStatus,
      externalWebsiteUrl: updated.externalWebsiteUrl,
      method: 'not_detected',
      externalScriptPings: updated.externalScriptPings,
      verifiedAt: updated.externalSyncVerifiedAt,
      message: `${fetchNote} Paste the 1-line script into your website <head> (or test with the Live Script Sandbox) and re-run Verify Connection.`,
    });
  });

  // MODULE 4: Manual Dual Google Indexing trigger endpoint
  app.post('/api/seo/reindex', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as { partner_id?: string };
    const partnerId = String(body.partner_id || '').trim();
    if (!partnerId) {
      res.status(400).json({ error: 'partner_id is required.' });
      return;
    }
    const existing = getSeoConfigByPartnerId(partnerId);
    if (!existing) {
      res.status(404).json({ error: 'Partner Dual-SEO config not found.' });
      return;
    }

    const receipts = await triggerDualIndexing(
      existing.internalListingUrl,
      existing.externalWebsiteUrl
    );
    const updated = updateDualIndexingReceipts(partnerId, receipts);
    res.json({
      config: updated,
      receipts,
    });
  });

  // Live External Website Sandbox: renders a minimal external business page embedding the 1-line <script>
  app.get('/external-preview/:partnerId', (req: Request, res: Response) => {
    const partnerId = String(req.params.partnerId || '').trim();
    const record = getSeoConfigByPartnerId(partnerId);
    if (!record) {
      res.status(404).send('Partner Dual-SEO config not found.');
      return;
    }
    const safeName = escapeHtml(record.businessName);
    const safeLoc = escapeHtml(record.location);
    const safeDesc = escapeHtml(record.description);
    const encodedId = encodeURIComponent(record.partnerId);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Unoptimized Partner Website — ${safeName}</title>
    <script src="/v1/dual-seo.js?partner_id=${encodedId}" async></script>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; padding: 24px; }
      .wrap { max-width: 820px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; }
      .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #ecfdf5; color: #065f46; font-size: 12px; font-weight: 600; }
      pre { background: #0f172a; color: #a7f3d0; padding: 14px; border-radius: 10px; overflow-x: auto; font-size: 12px; line-height: 1.5; }
      dt { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin-top: 12px; }
      dd { margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <span class="badge">External Partner Website Sandbox · Live Script Executed</span>
      <h1 style="margin: 12px 0 6px;">${safeName} (${safeLoc})</h1>
      <p style="color:#475569;font-size:14px;">${safeDesc}</p>
      <p style="font-size:13px;color:#065f46;font-weight:600;">
        This page started with a generic &lt;title&gt; and zero schema. Loading the 1-line &lt;script src="/v1/dual-seo.js?partner_id=${escapeHtml(record.partnerId)}" async&gt; in &lt;head&gt; synced all metadata below in real time and pinged the Partner Dashboard.
      </p>
      <dl>
        <dt>Live document.title</dt>
        <dd id="live-title">Waiting for dual-seo.js...</dd>
        <dt>Live meta[name="description"]</dt>
        <dd id="live-desc">Waiting...</dd>
        <dt>Live meta[name="keywords"]</dt>
        <dd id="live-kw">Waiting...</dd>
        <dt>Live link[rel="canonical"]</dt>
        <dd id="live-canon">Waiting...</dd>
        <dt>Live Injected JSON-LD (&lt;script type="application/ld+json"&gt;)</dt>
        <dd><pre id="live-jsonld">Waiting...</pre></dd>
      </dl>
    </div>
    <script>
      function readLiveHead() {
        document.getElementById('live-title').textContent = document.title;
        var desc = document.querySelector('meta[name="description"]');
        var kw = document.querySelector('meta[name="keywords"]');
        var canon = document.querySelector('link[rel="canonical"]');
        var schema = document.querySelector('script[data-wayanad-dual-seo="schema"]');
        document.getElementById('live-desc').textContent = desc ? desc.getAttribute('content') : 'Not injected yet';
        document.getElementById('live-kw').textContent = kw ? kw.getAttribute('content') : 'Not injected yet';
        document.getElementById('live-canon').textContent = canon ? canon.getAttribute('href') : 'Not injected yet';
        if (schema) {
          try {
            document.getElementById('live-jsonld').textContent = JSON.stringify(JSON.parse(schema.textContent), null, 2);
          } catch (e) {
            document.getElementById('live-jsonld').textContent = schema.textContent;
          }
        }
      }
      window.addEventListener('load', function () {
        setTimeout(readLiveHead, 120);
      });
    </script>
  </body>
</html>`);
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WayanadStays Dual-SEO server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start WayanadStays server:', err);
  process.exit(1);
});
