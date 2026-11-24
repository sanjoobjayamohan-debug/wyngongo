import { useState, type ReactNode } from 'react';
import type { PartnerCategory } from '../types/resort';
import {
  evaluatePasswordStrength,
  isValidPhoneOrEmail,
  PARTNER_CATEGORY_OPTIONS,
} from '../utils/authValidation';

interface AuthBenefitRow {
  emoji: string;
  text: string;
}

interface AuthShellProps {
  brandHeadline: string;
  brandParagraph: string;
  benefits: AuthBenefitRow[];
  formTitle: string;
  formSubtitle: string;
  children: ReactNode;
  testId: string;
}

function GoogleMarkSvg() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        fill="#EA4335"
        d="M12 5.04c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 1.73 14.96.67 12 .67 7.31.67 3.26 3.36 1.32 7.28l3.68 2.86C5.86 7.22 8.68 5.04 12 5.04z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.45c-.29 1.48-1.13 2.74-2.39 3.59l3.69 2.86c2.16-1.99 3.74-4.92 3.74-8.69z"
      />
      <path
        fill="#FBBC05"
        d="M5 14.86A6.99 6.99 0 0 1 4.64 12c0-.99.18-1.94.49-2.86L1.45 6.28A11.33 11.33 0 0 0 .67 12c0 1.84.44 3.58 1.21 5.12l3.12-2.26z"
      />
      <path
        fill="#34A853"
        d="M12 23.33c3.24 0 5.96-1.07 7.95-2.9l-3.69-2.86c-1.08.72-2.46 1.15-4.26 1.15-3.32 0-6.14-2.18-7-5.1L1.32 16.48c1.94 3.92 5.99 6.85 10.68 6.85z"
      />
    </svg>
  );
}

function AuthShell({
  brandHeadline,
  brandParagraph,
  benefits,
  formTitle,
  formSubtitle,
  children,
  testId,
}: AuthShellProps) {
  return (
    <main
      data-testid={testId}
      className="max-w-[1160px] mx-auto px-4 sm:px-6 py-8 sm:py-12"
    >
      <div className="rounded-[22px] border border-[#E2E8F0] bg-white min-h-[620px] grid grid-cols-1 min-[800px]:grid-cols-2 overflow-hidden shadow-xs">
        {/* Left Brand Panel */}
        <div className="bg-[linear-gradient(135deg,#022C22_0%,#065F46_54%,#34D399_100%)] text-white p-7 min-[800px]:p-12 flex flex-col justify-between gap-8">
          <div className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
            <span aria-hidden="true">🌿</span>
            <span>Wayngongo</span>
          </div>

          <div className="my-auto py-2">
            <h1 className="text-[26px] min-[800px]:text-[36px] font-bold leading-[1.15] tracking-tight text-white">
              {brandHeadline}
            </h1>
            <p className="text-sm sm:text-[15px] text-white/90 leading-relaxed mt-3.5 max-w-md">
              {brandParagraph}
            </p>
          </div>

          <ul className="space-y-2.5" aria-label="Platform highlights">
            {benefits.map((item) => (
              <li
                key={item.text}
                className="bg-white/12 rounded-[12px] px-4 py-3 flex items-center gap-3 text-[13px] font-medium text-white leading-snug"
              >
                <span aria-hidden="true" className="text-base shrink-0">
                  {item.emoji}
                </span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Form Column */}
        <div className="flex items-center justify-center p-6 min-[800px]:p-[44px] bg-white">
          <div className="w-full max-w-[500px] mx-auto">
            <div className="mb-6">
              <h2 className="text-[28px] font-bold tracking-tight text-[#0F172A] leading-tight">
                {formTitle}
              </h2>
              <p className="text-sm text-[#64748B] mt-1.5">{formSubtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

interface LoginPageViewProps {
  onShowToast: (message: string) => void;
  onLoginSuccess: (payload: {
    identifier: string;
    category: PartnerCategory;
  }) => void;
  onSwitchToSignup: () => void;
}

export function LoginPageView({
  onShowToast,
  onLoginSuccess,
  onSwitchToSignup,
}: LoginPageViewProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<PartnerCategory>('resort');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInlineError(null);

    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    if (!isValidPhoneOrEmail(identifier)) {
      setInlineError('Please enter a valid 10-digit mobile number or email address.');
      return;
    }

    onShowToast('Welcome back to Wayngongo Partner Dashboard!');
    onLoginSuccess({
      identifier: identifier.trim(),
      category,
    });
  };

  return (
    <AuthShell
      testId="login-page-view"
      brandHeadline="Welcome back to Wayngongo"
      brandParagraph="Partner Log In to manage your stays, menu, tour fleet, festival passes, and Google visibility."
      benefits={[
        {
          emoji: '📈',
          text: 'Track +42% more visitor clicks straight to your WhatsApp & website',
        },
        {
          emoji: '✨',
          text: 'Describe your offer in plain words and auto-optimize for Google',
        },
        {
          emoji: '🎟️',
          text: 'Manage Resorts, Budget Hotels, Restaurants, Tours & Event Passes',
        },
      ]}
      formTitle="Partner Log In"
      formSubtitle="Enter your phone or email to open your Partner Dashboard."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-identifier"
            className="block text-xs font-semibold text-[#0F172A] mb-1.5"
          >
            Phone or Email
          </label>
          <input
            id="login-identifier"
            type="text"
            required
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setInlineError(null);
            }}
            placeholder="owner@banasuramist.com or +91 98470 00000"
            className="w-full rounded-[10px] border border-[#E2E8F0] px-3.5 py-2.5 text-[14px] text-[#0F172A] placeholder:text-[#64748B]/70 bg-white focus:outline-none focus:border-[#065F46] focus:ring-3 focus:ring-[#065F46]/15 transition-colors motion-reduce:transition-none"
          />
        </div>

        <div>
          <label
            htmlFor="login-category"
            className="block text-xs font-semibold text-[#0F172A] mb-1.5"
          >
            Business Category
          </label>
          <select
            id="login-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as PartnerCategory)}
            className="w-full rounded-[10px] border border-[#E2E8F0] px-3.5 py-2.5 text-[14px] text-[#0F172A] bg-white focus:outline-none focus:border-[#065F46] focus:ring-3 focus:ring-[#065F46]/15 cursor-pointer"
          >
            {PARTNER_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold text-[#0F172A] mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-[10px] border border-[#E2E8F0] pl-3.5 pr-16 py-2.5 text-[14px] text-[#0F172A] placeholder:text-[#64748B]/70 bg-white focus:outline-none focus:border-[#065F46] focus:ring-3 focus:ring-[#065F46]/15 transition-colors motion-reduce:transition-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#065F46] hover:text-[#044E3A] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46] rounded"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs pt-0.5">
          <label className="inline-flex items-center gap-2 text-[#0F172A] font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              className="w-4 h-4 accent-[#065F46] rounded cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46]"
            />
            <span>Keep me logged in</span>
          </label>

          <button
            type="button"
            onClick={() =>
              onShowToast('Password reset link sent to your registered contact.')
            }
            className="font-semibold text-[#065F46] hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46] rounded"
          >
            Forgot password?
          </button>
        </div>

        {inlineError && (
          <p role="alert" className="text-xs font-semibold text-red-700">
            {inlineError}
          </p>
        )}

        <button
          type="submit"
          data-testid="login-submit-btn"
          className="w-full py-[13px] px-4 rounded-[10px] bg-[#065F46] hover:bg-[#044E3A] text-white text-sm font-bold transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46]"
        >
          Partner Log In
        </button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-[#E2E8F0]" aria-hidden="true" />
          <span className="text-xs font-medium text-[#64748B]">or</span>
          <span className="h-px flex-1 bg-[#E2E8F0]" aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={() => {
            onShowToast('Signed in with Google Partner Account');
            onLoginSuccess({
              identifier: 'partner@banasuramist.com',
              category,
            });
          }}
          className="w-full py-2.5 px-4 rounded-[10px] border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#0F172A] text-sm font-semibold inline-flex items-center justify-center gap-2.5 transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46]"
        >
          <GoogleMarkSvg />
          <span>Continue with Google</span>
        </button>

        <p className="text-center text-xs text-[#64748B] pt-2">
          New to Wayngongo?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-[#065F46] hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46] rounded"
          >
            Create Account / Register
          </button>
        </p>
      </form>
    </AuthShell>
  );
}

interface CreateAccountPageViewProps {
  onShowToast: (message: string) => void;
  onSignupSuccess: (payload: {
    businessName: string;
    contact: string;
    category: PartnerCategory;
  }) => void;
  onSwitchToLogin: () => void;
}

export function CreateAccountPageView({
  onShowToast,
  onSignupSuccess,
  onSwitchToLogin,
}: CreateAccountPageViewProps) {
  const [category, setCategory] = useState<PartnerCategory>('resort');
  const [businessName, setBusinessName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const strength = evaluatePasswordStrength(password);

  const barFillClass =
    strength.tone === 'red'
      ? 'bg-red-600'
      : strength.tone === 'amber'
        ? 'bg-[#D97706]'
        : strength.tone === 'emerald'
          ? 'bg-[#065F46]'
          : 'bg-transparent';

  const labelTextClass =
    strength.tone === 'red'
      ? 'text-red-700'
      : strength.tone === 'amber'
        ? 'text-[#D97706]'
        : strength.tone === 'emerald'
          ? 'text-[#065F46]'
          : 'text-[#64748B]';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInlineError(null);

    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    if (!businessName.trim()) {
      setInlineError('Please enter your Business Name.');
      return;
    }

    if (!isValidPhoneOrEmail(contact)) {
      setInlineError('Please enter a valid 10-digit phone number or email address.');
      return;
    }

    if (
      strength.score < 3 ||
      !strength.hasMinLength ||
      !strength.hasNumber ||
      !strength.hasMixedCase
    ) {
      setInlineError(
        'Password needs 8+ characters, a number, and both upper and lower case letters.'
      );
      return;
    }

    onShowToast(`Account created for ${businessName.trim()}. Welcome to Wayngongo!`);
    onSignupSuccess({
      businessName: businessName.trim(),
      contact: contact.trim(),
      category,
    });
  };

  return (
    <AuthShell
      testId="signup-page-view"
      brandHeadline="List your Wayanad business on Wayngongo"
      brandParagraph="Register your Resort, Budget Hotel, Restaurant, Tour Service, or Festival Event in under a minute. Direct WhatsApp & UPI bookings with zero commission."
      benefits={[
        {
          emoji: '💸',
          text: 'Zero commission. Tourists book & pay you directly on WhatsApp or UPI',
        },
        {
          emoji: '🔍',
          text: 'Instant Google Visibility Score & 1-click website sync tag',
        },
        {
          emoji: '📣',
          text: 'Promote on Top Hero Slider, Site Notification & Category Banners',
        },
      ]}
      formTitle="Create Account / Register"
      formSubtitle="Choose your category to unlock your tailored Partner Dashboard."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* 1. Category Selector */}
        <div>
          <span className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Select Business Category
          </span>
          <div
            role="radiogroup"
            aria-label="Select Business Category"
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
          >
            {PARTNER_CATEGORY_OPTIONS.map((opt) => {
              const selected = category === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-testid={`signup-category-${opt.id}`}
                  onClick={() => setCategory(opt.id)}
                  className={`px-2.5 py-2 rounded-[10px] border text-xs font-semibold text-center transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46] ${
                    selected
                      ? 'bg-[#D1FAE5] border-[#065F46] text-[#065F46]'
                      : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Business Name */}
        <div>
          <label
            htmlFor="signup-business-name"
            className="block text-xs font-semibold text-[#0F172A] mb-1"
          >
            Business Name
          </label>
          <input
            id="signup-business-name"
            type="text"
            required
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              setInlineError(null);
            }}
            placeholder={
              category === 'events'
                ? 'e.g. Poopoli Flower Show Wayanad'
                : category === 'restaurant'
                  ? 'e.g. Pepper Leaf Kitchen Kalpetta'
                  : category === 'tour'
                    ? 'e.g. Wayanad Trails & 4x4 Tours'
                    : category === 'budget_hotel'
                      ? 'e.g. Hillview Budget Inn'
                      : 'e.g. Banasura Mist Eco Villas'
            }
            className="w-full rounded-[10px] border border-[#E2E8F0] px-3.5 py-2.5 text-[14px] text-[#0F172A] placeholder:text-[#64748B]/70 bg-white focus:outline-none focus:border-[#065F46] focus:ring-3 focus:ring-[#065F46]/15 transition-colors motion-reduce:transition-none"
          />
        </div>

        {/* 3. Phone or Email */}
        <div>
          <label
            htmlFor="signup-contact"
            className="block text-xs font-semibold text-[#0F172A] mb-1"
          >
            Phone or Email
          </label>
          <input
            id="signup-contact"
            type="text"
            required
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              setInlineError(null);
            }}
            placeholder="+91 98470 00000 or owner@business.com"
            className="w-full rounded-[10px] border border-[#E2E8F0] px-3.5 py-2.5 text-[14px] text-[#0F172A] placeholder:text-[#64748B]/70 bg-white focus:outline-none focus:border-[#065F46] focus:ring-3 focus:ring-[#065F46]/15 transition-colors motion-reduce:transition-none"
          />
        </div>

        {/* 4. Password with Show / Hide toggle & Strength bar */}
        <div>
          <label
            htmlFor="signup-password"
            className="block text-xs font-semibold text-[#0F172A] mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setInlineError(null);
              }}
              placeholder="Create a strong password"
              className="w-full rounded-[10px] border border-[#E2E8F0] pl-3.5 pr-16 py-2.5 text-[14px] text-[#0F172A] placeholder:text-[#64748B]/70 bg-white focus:outline-none focus:border-[#065F46] focus:ring-3 focus:ring-[#065F46]/15 transition-colors motion-reduce:transition-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#065F46] hover:text-[#044E3A] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46] rounded"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div
            data-testid="password-strength-track"
            className="mt-2 h-[6px] w-full rounded-full bg-[#E2E8F0] overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={strength.percent}
            aria-label="Password strength"
          >
            <div
              data-testid="password-strength-fill"
              className={`h-full rounded-full transition-all duration-150 motion-reduce:transition-none ${barFillClass}`}
              style={{ width: `${strength.percent}%` }}
            />
          </div>
          <p
            data-testid="password-strength-label"
            className={`mt-1 text-[11px] font-medium ${labelTextClass}`}
          >
            {strength.label}
          </p>
        </div>

        {/* 5. Terms Checkbox */}
        <label className="flex items-start gap-2 text-xs text-[#0F172A] pt-0.5 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#065F46] rounded cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46]"
          />
          <span>I agree to the Wayngongo Partner Terms and Privacy Policy</span>
        </label>

        {inlineError && (
          <p
            role="alert"
            data-testid="signup-inline-error"
            className="text-xs font-semibold text-red-700"
          >
            {inlineError}
          </p>
        )}

        <button
          type="submit"
          data-testid="signup-submit-btn"
          className="w-full py-[13px] px-4 rounded-[10px] bg-[#065F46] hover:bg-[#044E3A] text-white text-sm font-bold transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46]"
        >
          Create Account &amp; Open Dashboard
        </button>

        <p className="text-center text-xs text-[#64748B] pt-1">
          Already registered on Wayngongo?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#065F46] hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46] rounded"
          >
            Partner Log In
          </button>
        </p>
      </form>
    </AuthShell>
  );
}
