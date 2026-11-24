import type { DualIndexingReceipt } from '../src/types/dualSeo.ts';
import { sanitizeSafeHttpUrl } from '../src/utils/dualSeo.ts';

const GOOGLE_INDEXING_ENDPOINT =
  'https://indexing.googleapis.com/v3/urlNotifications:publish';

async function publishUrlUpdate(
  target: 'internal' | 'external',
  rawUrl: string,
  accessToken: string | undefined
): Promise<DualIndexingReceipt> {
  const dispatchedAt = new Date().toISOString();
  const safeUrl = sanitizeSafeHttpUrl(rawUrl);

  if (!safeUrl) {
    return {
      target,
      url: rawUrl,
      notificationType: 'URL_UPDATED',
      status: 'skipped_invalid_url',
      detail: 'Skipped Google Indexing ping: URL must use http:// or https://.',
      dispatchedAt,
    };
  }

  if (!accessToken) {
    return {
      target,
      url: safeUrl,
      notificationType: 'URL_UPDATED',
      status: 'queued_credentials_required',
      detail:
        'URL_UPDATED payload prepared; attach GOOGLE_INDEXING_ACCESS_TOKEN in server environment to transmit directly to Google Indexing API v3.',
      dispatchedAt,
    };
  }

  try {
    const res = await fetch(GOOGLE_INDEXING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url: safeUrl,
        type: 'URL_UPDATED',
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      return {
        target,
        url: safeUrl,
        notificationType: 'URL_UPDATED',
        status: 'submitted',
        httpStatus: res.status,
        detail: `Google Indexing API v3 accepted URL_UPDATED (${res.status} OK).`,
        dispatchedAt,
      };
    }

    const errBody = await res.text().catch(() => '');
    return {
      target,
      url: safeUrl,
      notificationType: 'URL_UPDATED',
      status: 'failed',
      httpStatus: res.status,
      detail: `Google Indexing API returned HTTP ${res.status}${
        errBody ? `: ${errBody.slice(0, 140)}` : ''
      }`,
      dispatchedAt,
    };
  } catch (err) {
    return {
      target,
      url: safeUrl,
      notificationType: 'URL_UPDATED',
      status: 'failed',
      detail:
        err instanceof Error
          ? `Indexing API request failed: ${err.message}`
          : 'Indexing API network error',
      dispatchedAt,
    };
  }
}

/**
 * MODULE 4: Dual Google Indexing API Trigger
 * Dispatches URL_UPDATED notifications for BOTH our platform listing URL
 * and the partner's external official website URL.
 */
export async function triggerDualIndexing(
  internalUrl: string,
  externalUrl: string
): Promise<DualIndexingReceipt[]> {
  const accessToken = process.env.GOOGLE_INDEXING_ACCESS_TOKEN?.trim() || undefined;
  const results = await Promise.all([
    publishUrlUpdate('internal', internalUrl, accessToken),
    publishUrlUpdate('external', externalUrl, accessToken),
  ]);
  return results;
}
