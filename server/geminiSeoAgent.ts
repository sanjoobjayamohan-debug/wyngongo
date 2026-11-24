import { GoogleGenAI, Type } from '@google/genai';
import type { DualSeoFaq, DualSeoGenerateInput } from '../src/types/dualSeo.ts';
import {
  buildContextualAnchors,
  normalizeLongTailKeywords,
  normalizeMetaDescription,
  normalizeMetaTitle,
} from '../src/utils/dualSeo.ts';

export class GeminiSeoError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'GeminiSeoError';
    this.statusCode = statusCode;
  }
}

export interface GeneratedDualSeoFields {
  metaTitle: string;
  metaDescription: string;
  longTailKeywords: string[];
  faqs: DualSeoFaq[];
  anchorTextVariants: string[];
}

interface RawGeminiSeoResponse {
  meta_title?: string;
  meta_description?: string;
  long_tail_keywords?: string[];
  faqs?: Array<{ question?: string; answer?: string }>;
  anchor_text_variants?: string[];
}

export async function generateSeoWithGemini(
  input: DualSeoGenerateInput
): Promise<GeneratedDualSeoFields> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiSeoError(
      'GEMINI_API_KEY is not configured in server secrets. Please set GEMINI_API_KEY in Settings > Secrets.',
      503
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const prompt = `You are a Principal Technical SEO Engineer specializing in Wayanad (Kerala, India) tourism and hospitality.
Generate Dual-SEO metadata for the following listing so it ranks in Google Search both on our WayanadStays directory and on the business owner's external website:

- Business Name: ${input.business_name}
- Category: ${input.category}
- Wayanad Location: ${input.location}
- Price Range: ${input.price_range || 'Direct rates available'}
- Active Seasonal Offer: ${input.offers || 'Direct booking special'}
- Raw Owner Keywords: ${input.raw_keywords || 'wayanad direct booking'}
- Description: ${input.description || 'Verified local Wayanad hospitality partner.'}
- Official External Website: ${input.external_website_url}

Requirements:
1. meta_title: High-CTR SEO title, STRICTLY 60 characters or fewer, targeting Wayanad tourist search intent.
2. meta_description: Compelling meta description, STRICTLY 155 characters or fewer, highlighting location, offer, and direct booking.
3. long_tail_keywords: Exactly 10 hyperlocal Wayanad long-tail search phrases (e.g., "budget resort near Banasura Dam", "Wayanad winter package").
4. faqs: Exactly 5 realistic tourist Q&As tailored to this ${input.category} in ${input.location}, Wayanad for FAQPage rich snippets.
5. anchor_text_variants: Exactly 3 descriptive, keyword-rich anchor texts for linking to their external booking website (e.g., "Official Booking Website – ${input.business_name} in ${input.location}, Wayanad"). Never use generic "Visit Website" or "Click Here".`;

  try {
    let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null = null;
    let lastError: unknown = null;
    const retryDelaysMs = [700, 1500];

    for (let attempt = 0; attempt <= retryDelaysMs.length; attempt += 1) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            systemInstruction:
              'Respond strictly in valid JSON matching the provided responseSchema. Keep meta_title <= 60 characters and meta_description <= 155 characters.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                meta_title: {
                  type: Type.STRING,
                  description: 'High-CTR Wayanad SEO meta title under 60 characters.',
                },
                meta_description: {
                  type: Type.STRING,
                  description: 'Wayanad SEO meta description under 155 characters.',
                },
                long_tail_keywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '10 hyperlocal Wayanad long-tail search phrases.',
                },
                faqs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      answer: { type: Type.STRING },
                    },
                    required: ['question', 'answer'],
                  },
                  description: '5 tourist Q&As for Schema.org FAQPage rich snippets.',
                },
                anchor_text_variants: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3 keyword-rich contextual anchor text phrases for external site link.',
                },
              },
              required: [
                'meta_title',
                'meta_description',
                'long_tail_keywords',
                'faqs',
                'anchor_text_variants',
              ],
            },
          },
        });
        break;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : '';
        const isTransient =
          msg.includes('503') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED');
        if (!isTransient || attempt === retryDelaysMs.length) {
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelaysMs[attempt]));
      }
    }

    if (!response) {
      throw lastError ?? new Error('Gemini SEO generation failed.');
    }

    const rawText = response.text?.trim();
    if (!rawText) {
      throw new GeminiSeoError('Gemini returned an empty SEO generation payload.', 502);
    }

    const parsed = JSON.parse(rawText) as RawGeminiSeoResponse;

    const metaTitle = normalizeMetaTitle(
      parsed.meta_title ?? '',
      input.business_name,
      input.location
    );
    const metaDescription = normalizeMetaDescription(
      parsed.meta_description ?? '',
      input.business_name,
      input.location,
      input.offers
    );
    const longTailKeywords = normalizeLongTailKeywords(
      Array.isArray(parsed.long_tail_keywords) ? parsed.long_tail_keywords : [],
      input.business_name,
      input.category,
      input.location,
      input.raw_keywords
    );

    const parsedFaqs: DualSeoFaq[] = Array.isArray(parsed.faqs)
      ? parsed.faqs
          .filter(
            (item): item is { question: string; answer: string } =>
              Boolean(item?.question?.trim() && item?.answer?.trim())
          )
          .map((item) => ({
            question: item.question.trim(),
            answer: item.answer.trim(),
          }))
          .slice(0, 5)
      : [];

    while (parsedFaqs.length < 5) {
      const idx = parsedFaqs.length + 1;
      parsedFaqs.push({
        question: `How do I book ${input.business_name} in ${input.location}, Wayanad directly? (${idx})`,
        answer: `Book directly via WayanadStays or ${input.external_website_url} to access ${
          input.offers || 'verified local rates'
        } with zero commission.`,
      });
    }

    const fallbackAnchors = buildContextualAnchors(
      input.business_name,
      input.category,
      input.location,
      input.offers
    );
    const rawAnchors = Array.isArray(parsed.anchor_text_variants)
      ? parsed.anchor_text_variants
          .map((a) => a.trim())
          .filter((a) => a.length >= 12 && !/^visit website$/i.test(a))
      : [];
    const anchorTextVariants =
      rawAnchors.length >= 2 ? rawAnchors.slice(0, 3) : fallbackAnchors;

    return {
      metaTitle,
      metaDescription,
      longTailKeywords,
      faqs: parsedFaqs,
      anchorTextVariants,
    };
  } catch (err) {
    if (err instanceof GeminiSeoError) {
      throw err;
    }
    const rawMsg = err instanceof Error ? err.message : 'Unknown Gemini API error';
    let cleanMsg = rawMsg;
    try {
      const maybeJson = JSON.parse(rawMsg) as { error?: { message?: string } };
      if (maybeJson?.error?.message) {
        cleanMsg = maybeJson.error.message;
      }
    } catch {
      // keep rawMsg
    }

    if (
      rawMsg.includes('403') ||
      rawMsg.includes('PERMISSION_DENIED') ||
      rawMsg.includes('API_KEY_INVALID')
    ) {
      throw new GeminiSeoError(
        'Gemini API key was rejected. Please verify GEMINI_API_KEY in Settings > Secrets.',
        403
      );
    }
    if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
      throw new GeminiSeoError(
        'Gemini API rate limit reached. Please retry in a few seconds.',
        429
      );
    }
    if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE')) {
      throw new GeminiSeoError(
        `Gemini AI service is temporarily busy (${cleanMsg}). Please retry in a few seconds.`,
        503
      );
    }
    throw new GeminiSeoError(`Gemini SEO generation failed: ${cleanMsg}`, 502);
  }
}
