import { useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import type { UserRatingEntry } from '../types/resort';
import {
  computeUpdatedRating,
  RATING_LABELS,
  validateUserRatingInput,
} from '../utils/userRatings';

interface UserRatingSectionProps {
  listingName: string;
  baseRating: number;
  baseReviewCount: number;
  userRatings: UserRatingEntry[];
  onSubmitRating: (entry: UserRatingEntry) => void;
}

export function UserRatingSection({
  listingName,
  baseRating,
  baseReviewCount,
  userRatings,
  onSubmitRating,
}: UserRatingSectionProps) {
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [authorName, setAuthorName] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const summary = computeUpdatedRating(baseRating, baseReviewCount, userRatings);
  const activeStars = hoverStars > 0 ? hoverStars : selectedStars;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const check = validateUserRatingInput(selectedStars, comment);
    if (!check.valid) {
      setError(check.error ?? 'Please select a valid star rating.');
      return;
    }
    const entry: UserRatingEntry = {
      id: `rate-${Date.now()}`,
      authorName: authorName.trim() || 'Verified Wayanad Visitor',
      stars: selectedStars,
      comment: comment.trim(),
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };
    onSubmitRating(entry);
    setAuthorName('');
    setComment('');
    setSubmittedNotice(
      `Thanks! Your ${selectedStars}-star rating for ${listingName} has been recorded.`
    );
  };

  return (
    <section
      aria-labelledby="user-rate-heading"
      data-testid="user-rating-section"
      className="pb-6 border-b border-slate-200 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="user-rate-heading" className="text-lg font-bold text-slate-900">
            Guest Rating &amp; Review
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Share your experience at {listingName} to help fellow Wayanad travellers.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 tabular-nums">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" aria-hidden="true" />
          <span
            data-testid="live-aggregate-rating"
            className="text-sm font-bold text-slate-900"
          >
            {summary.averageRating.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500">
            ({summary.totalReviews} {summary.totalReviews === 1 ? 'rating' : 'ratings'})
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4"
      >
        <div>
          <span className="block text-xs font-semibold text-slate-800 mb-2">
            Your Rating
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <div
              role="radiogroup"
              aria-label="Select your rating from 1 to 5 stars"
              className="inline-flex items-center gap-1.5"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= activeStars;
                return (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={selectedStars === star}
                    aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
                    data-testid={`user-rate-star-${star}`}
                    onMouseEnter={() => setHoverStars(star)}
                    onMouseLeave={() => setHoverStars(0)}
                    onClick={() => {
                      setSelectedStars(star);
                      setError(null);
                      setSubmittedNotice(null);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#065F46]"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        filled
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-slate-300'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-emerald-900 tabular-nums">
              {selectedStars}.0 / 5 · {RATING_LABELS[selectedStars]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="user-rate-author"
              className="block text-[11px] font-semibold text-slate-700 mb-1"
            >
              Your Name (optional)
            </label>
            <input
              id="user-rate-author"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Ananya Menon"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-[#065F46]"
            />
          </div>

          <div>
            <label
              htmlFor="user-rate-comment"
              className="block text-[11px] font-semibold text-slate-700 mb-1"
            >
              Quick Review Note (optional)
            </label>
            <input
              id="user-rate-comment"
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Clean stay, scenic mist view, warm hospitality..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-[#065F46]"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs font-semibold text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {submittedNotice ? (
            <p
              role="status"
              data-testid="user-rating-confirmation"
              className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{submittedNotice}</span>
            </p>
          ) : (
            <span className="text-xs text-slate-500">
              Ratings update the listing score immediately.
            </span>
          )}

          <button
            type="submit"
            data-testid="submit-user-rating-btn"
            className="px-4 py-2 rounded-lg bg-[#065F46] hover:bg-[#044E3A] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Submit Rating
          </button>
        </div>
      </form>

      {userRatings.length > 0 && (
        <ul className="space-y-2.5">
          {userRatings.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-900">{item.authorName}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{item.createdAt}</span>
                </div>
                {item.comment && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.comment}
                  </p>
                )}
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 shrink-0 tabular-nums">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" aria-hidden="true" />
                <span>{item.stars}.0</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
