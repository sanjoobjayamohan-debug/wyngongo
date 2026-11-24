import type { AmenityKey, Resort, SeoAgentOutput, SeoTaskItem } from '../types/resort';

export interface SeoChecklistProgress {
  tasks: SeoTaskItem[];
  completedCount: number;
  totalCount: number;
  percent: number;
}

export interface SeoChecklistManualOverrides {
  altTextVerified?: boolean;
  schemaVerified?: boolean;
}

export function evaluateSeoChecklist(
  resort: Resort,
  seoOutput: SeoAgentOutput,
  hasOptimizedMeta: boolean,
  overrides: SeoChecklistManualOverrides = {}
): SeoChecklistProgress {
  const metaDone =
    hasOptimizedMeta &&
    seoOutput.metaTitle.trim().length >= 25 &&
    seoOutput.metaDescription.trim().length >= 80;

  const altTextText = (resort.imageAltText ?? '').trim();
  const altTextDone =
    Boolean(overrides.altTextVerified) || altTextText.length >= 18;

  const schemaDone =
    seoOutput.schemaActive &&
    (overrides.schemaVerified !== undefined ? overrides.schemaVerified : true) &&
    seoOutput.jsonLd['@type'] === 'LodgingBusiness';

  const offerProfileDone =
    resort.offerPill.trim().length >= 8 &&
    resort.whatsappNumber.trim().length >= 10 &&
    resort.upiId.trim().includes('@');

  const amenitiesMediaDone =
    resort.amenities.length >= 4 && Boolean(resort.hasVideoTour);

  const tasks: SeoTaskItem[] = [
    {
      id: 'meta_tags',
      title: 'Optimize SEO Meta Title & Description',
      description: metaDone
        ? 'Meta title & Wayanad keyword description are indexed.'
        : 'Run the AI SEO Agent with your resort highlights to lock fresh meta tags.',
      completed: metaDone,
      actionLabel: metaDone ? 'Optimized' : 'Optimize Meta Tags',
    },
    {
      id: 'image_alt',
      title: 'Verify Descriptive Image Alt-Text',
      description: altTextDone
        ? `Active alt-text: "${altTextText || `${resort.name} in ${resort.location}, Wayanad`}"`
        : 'Add descriptive location & property alt-text for Google Image Search.',
      completed: altTextDone,
      actionLabel: altTextDone ? 'Verified' : 'Add Alt-Text',
    },
    {
      id: 'schema',
      title: 'Implement LodgingBusiness JSON-LD Schema',
      description: schemaDone
        ? 'Rich snippet schema with nightly ₹ price & aggregate rating is live.'
        : 'Enable structured LodgingBusiness schema for Google rich results.',
      completed: schemaDone,
      actionLabel: schemaDone ? 'Schema Live' : 'Enable Schema',
    },
    {
      id: 'offer_profile',
      title: 'Complete Direct Booking & Free Offer Setup',
      description: offerProfileDone
        ? 'WhatsApp desk, UPI ID, and direct offer badge are active.'
        : 'Add WhatsApp number, UPI ID, and a free seasonal offer badge.',
      completed: offerProfileDone,
      actionLabel: offerProfileDone ? 'Complete' : 'Edit Profile',
    },
    {
      id: 'amenities_media',
      title: 'List 4+ Amenities & Short Video Walkthrough',
      description: amenitiesMediaDone
        ? `${resort.amenities.length} amenities and video walkthrough published.`
        : 'Add at least 4 amenities and a video tour caption to boost engagement.',
      completed: amenitiesMediaDone,
      actionLabel: amenitiesMediaDone ? 'Published' : 'Add Amenities',
    },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  return {
    tasks,
    completedCount,
    totalCount,
    percent,
  };
}

export function sliceVisibleAmenities(
  amenities: AmenityKey[],
  maxVisible?: number
): {
  visible: AmenityKey[];
  totalCount: number;
  hiddenCount: number;
} {
  const limit =
    typeof maxVisible === 'number' && maxVisible > 0
      ? maxVisible
      : amenities.length;
  const visible = amenities.slice(0, limit);
  return {
    visible,
    totalCount: amenities.length,
    hiddenCount: Math.max(0, amenities.length - visible.length),
  };
}
