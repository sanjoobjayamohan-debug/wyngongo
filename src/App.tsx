import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutGroup, MotionConfig } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';
import type {
  AdSlotConfig,
  AdSlotId,
  AppView,
  BudgetHotel,
  CrossPromoAd,
  EventTicketListing,
  HeroAdSlide,
  LocalRestaurant,
  PartnerAccount,
  Resort,
  ServiceDetailSelection,
  TourOperator,
  UserRatingEntry,
  WeeklyDeal,
  WayanadLocation,
} from './types/resort';
import type { DualSeoConfigRecord } from './types/dualSeo';
import {
  WAYANAD_BUDGET_HOTELS,
  WAYANAD_EVENTS,
  WAYANAD_RESTAURANTS,
  WAYANAD_TOUR_OPERATORS,
} from './data/localDirectoryData';
import {
  INITIAL_AD_SLOT_CONFIGS,
  INITIAL_CROSS_PROMO_ADS,
  INITIAL_HERO_ADS,
  INITIAL_RESORTS,
  INITIAL_WEEKLY_DEALS,
} from './data/mockWayanadData';
import { canAccessPartnerDashboard } from './utils/authValidation';
import { optimizeResortSeo } from './utils/seoEngine';
import { toggleCompareResort } from './utils/resortCompare';
import type { createServiceItemRecord } from './utils/localDirectory';
import { AnnouncementStrip } from './components/AnnouncementStrip';
import { Navbar } from './components/Navbar';
import {
  TouristDirectory,
  type DirectoryBannerAd,
} from './components/TouristDirectory';
import { ResortCompareModal } from './components/ResortCompareModal';
import { PropertyDetailView } from './components/PropertyDetailView';
import { ServiceDetailView } from './components/ServiceDetailView';
import { OwnerDashboardView } from './components/OwnerDashboardView';
import {
  CreateAccountPageView,
  LoginPageView,
} from './components/AuthPagesView';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('directory');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<WayanadLocation>('All Wayanad');
  const [resorts, setResorts] = useState<Resort[]>(INITIAL_RESORTS);
  const [restaurants, setRestaurants] = useState<LocalRestaurant[]>(WAYANAD_RESTAURANTS);
  const [budgetHotels, setBudgetHotels] = useState<BudgetHotel[]>(WAYANAD_BUDGET_HOTELS);
  const [tourOperators, setTourOperators] = useState<TourOperator[]>(WAYANAD_TOUR_OPERATORS);
  const [events, setEvents] = useState<EventTicketListing[]>(WAYANAD_EVENTS);
  const [selectedResortId, setSelectedResortId] = useState<string>(
    INITIAL_RESORTS[0].id
  );
  const [activeServiceSelection, setActiveServiceSelection] =
    useState<ServiceDetailSelection>({
      kind: 'restaurant',
      id: WAYANAD_RESTAURANTS[0].id,
    });
  const [partnerAccount, setPartnerAccount] = useState<PartnerAccount | null>(null);
  const [ownerResortId, setOwnerResortId] = useState<string>(
    INITIAL_RESORTS[1].id
  );
  const [dualSeoConfigs, setDualSeoConfigs] = useState<DualSeoConfigRecord[]>([]);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [userRatingsByTarget, setUserRatingsByTarget] = useState<
    Record<string, UserRatingEntry[]>
  >({});
  const [apiOrigin, setApiOrigin] = useState<string>(
    typeof window !== 'undefined' ? window.location.origin : ''
  );

  useEffect(() => {
    let active = true;
    fetch('/api/seo/configs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { apiOrigin?: string; configs?: DualSeoConfigRecord[] } | null) => {
        if (!active || !data) return;
        if (data.apiOrigin) setApiOrigin(data.apiOrigin);
        if (Array.isArray(data.configs)) setDualSeoConfigs(data.configs);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 4500);
  }, []);

  const hasPartnerAccess = canAccessPartnerDashboard(partnerAccount);

  const navigateToView = useCallback(
    (view: AppView) => {
      // Strict access control: block public visitors from accessing Partner Dashboard
      if (view === 'dashboard' && !canAccessPartnerDashboard(partnerAccount)) {
        setActiveView('login');
        showToast('Please log in or create a partner account to open the dashboard.');
        return;
      }
      setActiveView(view);
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    },
    [partnerAccount, showToast]
  );

  const handlePartnerLogout = useCallback(() => {
    setPartnerAccount(null);
    setActiveView('directory');
    showToast('Logged out of Partner Dashboard.');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [showToast]);

  const handleDualSeoConfigUpdated = (updated: DualSeoConfigRecord) => {
    setDualSeoConfigs((prev) => {
      const exists = prev.some((item) => item.partnerId === updated.partnerId);
      if (!exists) return [updated, ...prev];
      return prev.map((item) =>
        item.partnerId === updated.partnerId ? updated : item
      );
    });
  };

  // Notification Strip state (Paid Broadcast Slot)
  const [stripDismissed, setStripDismissed] = useState(false);
  const [stripPromo, setStripPromo] = useState<{
    message: string;
    resortId: string;
  }>({
    message: 'Winter Special: 40% Off at Misty Woods Vythiri',
    resortId: 'misty-woods-vythiri',
  });

  // Paid Ad Slots State
  const [heroSlides, setHeroSlides] = useState<HeroAdSlide[]>(INITIAL_HERO_ADS);
  const [crossPromoAds, setCrossPromoAds] = useState<CrossPromoAd[]>(
    INITIAL_CROSS_PROMO_ADS
  );
  const [directoryBanner, setDirectoryBanner] =
    useState<DirectoryBannerAd | null>(null);
  const [weeklyDeals] = useState<WeeklyDeal[]>(INITIAL_WEEKLY_DEALS);
  const [adConfigs, setAdConfigs] = useState<Record<AdSlotId, AdSlotConfig>>(
    INITIAL_AD_SLOT_CONFIGS
  );
  const [activeCampaignCount, setActiveCampaignCount] = useState<number>(1);

  // Beginner-Friendly Google Visibility & Checklist State
  const ownerResort =
    resorts.find((r) => r.id === ownerResortId) ?? resorts[0];
  const [ownerSeoNotes, setOwnerSeoNotes] = useState<string>(
    'Peaceful lakefront eco villas near Banasura Dam with private plunge pool and Kerala breakfast.'
  );
  const [appliedSeoNotes, setAppliedSeoNotes] = useState<string>('');
  const [hasOptimizedMeta, setHasOptimizedMeta] = useState<boolean>(false);
  const [schemaVerified, setSchemaVerified] = useState<boolean>(true);

  const seoOutput = useMemo(
    () => optimizeResortSeo(ownerResort, appliedSeoNotes),
    [ownerResort, appliedSeoNotes]
  );

  const filteredResorts = useMemo(() => {
    if (selectedLocation === 'All Wayanad') return resorts;
    return resorts.filter((r) => r.location === selectedLocation);
  }, [resorts, selectedLocation]);

  const activeDetailResort =
    resorts.find((r) => r.id === selectedResortId) ?? resorts[0];

  const handleOpenResortDetail = (resortId: string) => {
    setSelectedResortId(resortId);
    setActiveView('detail');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleOpenServiceDetail = (selection: ServiceDetailSelection) => {
    setActiveServiceSelection(selection);
    setActiveView('service_detail');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handlePublishPartnerRecord = (
    created: ReturnType<typeof createServiceItemRecord>
  ): { detailKind: 'resort' | 'service'; id: string } => {
    if (created.kind === 'restaurant') {
      setRestaurants((prev) => [created.record, ...prev]);
      return { detailKind: 'service', id: created.record.id };
    }
    if (created.kind === 'budget_hotel') {
      setBudgetHotels((prev) => [created.record, ...prev]);
      return { detailKind: 'service', id: created.record.id };
    }
    if (created.kind === 'tour') {
      setTourOperators((prev) => [created.record, ...prev]);
      return { detailKind: 'service', id: created.record.id };
    }
    if (created.kind === 'event') {
      setEvents((prev) => [created.record, ...prev]);
      return { detailKind: 'service', id: created.record.id };
    }
    setResorts((prev) => [created.record, ...prev]);
    setOwnerResortId(created.record.id);
    return { detailKind: 'resort', id: created.record.id };
  };

  const handleUpdateAdConfig = (
    slotId: AdSlotId,
    patch: Partial<AdSlotConfig>
  ) => {
    setAdConfigs((prev) => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        ...patch,
      },
    }));
  };

  const handlePublishAds = (): { ok: boolean; message: string } => {
    let publishedSlots = 0;

    if (adConfigs.hero_slider.selected) {
      const cfg = adConfigs.hero_slider;
      setHeroSlides((prev) => [
        {
          id: `hero-owner-${Date.now()}`,
          resortId: ownerResort.id,
          resortName: partnerAccount?.businessName || ownerResort.name,
          location: ownerResort.location,
          headline: cfg.headline.trim() || ownerResort.offerPill,
          subheadline: `${ownerResort.landmarkDistance} · Book direct from ₹${ownerResort.pricePerNight.toLocaleString('en-IN')}/night.`,
          offerTag: ownerResort.location,
          ctaLabel: 'Claim Offer / Visit Site',
          imageUrl: cfg.bannerUrl,
          redirectUrl: cfg.redirectUrl,
        },
        ...prev.filter((slide) => slide.resortId !== ownerResort.id),
      ]);
      publishedSlots += 1;
    }

    if (adConfigs.cross_promo.selected) {
      const cfg = adConfigs.cross_promo;
      setCrossPromoAds((prev) => [
        {
          id: `cross-owner-${Date.now()}`,
          resortId: ownerResort.id,
          resortName: partnerAccount?.businessName || ownerResort.name,
          location: ownerResort.location,
          tagline: cfg.headline.trim() || ownerResort.landmarkDistance,
          offerBadge: ownerResort.offerPill,
          imageUrl: cfg.bannerUrl,
          redirectUrl: cfg.redirectUrl,
        },
        ...prev.filter((ad) => ad.resortId !== ownerResort.id),
      ]);
      publishedSlots += 1;
    }

    if (adConfigs.notification_bar.selected) {
      const cfg = adConfigs.notification_bar;
      setStripPromo({
        message: cfg.headline.trim(),
        resortId: ownerResort.id,
      });
      setStripDismissed(false);
      publishedSlots += 1;
    }

    if (adConfigs.directory_banner.selected) {
      const cfg = adConfigs.directory_banner;
      setDirectoryBanner({
        id: `dir-owner-${Date.now()}`,
        resortId: ownerResort.id,
        resortName: partnerAccount?.businessName || ownerResort.name,
        headline: cfg.headline.trim() || ownerResort.offerPill,
        imageUrl: cfg.bannerUrl,
        redirectUrl: cfg.redirectUrl,
      });
      publishedSlots += 1;
    }

    setActiveCampaignCount(publishedSlots);

    return {
      ok: true,
      message: `Published ${publishedSlots} promotional placement${
        publishedSlots === 1 ? '' : 's'
      } live to the Wayngongo Directory.`,
    };
  };

  const handleSaveListingDetails = (
    resortId: string,
    updates: Partial<
      Pick<
        Resort,
        | 'name'
        | 'pricePerNight'
        | 'offerPill'
        | 'whatsappNumber'
        | 'upiId'
        | 'directBookingUrl'
        | 'primaryImage'
        | 'imageAltText'
        | 'videoLabel'
        | 'amenities'
        | 'maxAmenitiesVisible'
        | 'mapUrl'
        | 'mapCoordinates'
      >
    >
  ) => {
    setResorts((prev) =>
      prev.map((item) =>
        item.id === resortId
          ? {
              ...item,
              ...updates,
              hasVideoTour: Boolean(updates.videoLabel ?? item.videoLabel),
            }
          : item
      )
    );
  };

  const handleAddUserRating = useCallback(
    (targetKey: string, entry: UserRatingEntry) => {
      setUserRatingsByTarget((prev) => ({
        ...prev,
        [targetKey]: [entry, ...(prev[targetKey] ?? [])],
      }));
      showToast('Thank you! Your review has been added.');
    },
    [showToast]
  );

  const handleToggleCompare = useCallback(
    (resortId: string) => {
      setSelectedCompareIds((prev) => {
        const result = toggleCompareResort(prev, resortId);
        if (result.limitReached) {
          showToast('You can compare up to 3 resorts at once. Remove one to add another.');
          return prev;
        }
        return result.nextIds;
      });
    },
    [showToast]
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 overflow-x-clip">
      {!stripDismissed && (
        <AnnouncementStrip
          message={stripPromo.message}
          ctaLabel="Grab Deal"
          onAction={() => handleOpenResortDetail(stripPromo.resortId)}
          onDismiss={() => setStripDismissed(true)}
        />
      )}

      <Navbar
        activeView={activeView}
        partnerAccount={hasPartnerAccess ? partnerAccount : null}
        onSelectView={navigateToView}
        onLogout={handlePartnerLogout}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        weeklyDeals={weeklyDeals}
        onSelectDealResort={handleOpenResortDetail}
        filteredCount={filteredResorts.length}
      />

      <MotionConfig reducedMotion="user">
        <LayoutGroup>
          <div className="flex-1 w-full min-w-0">
            {activeView === 'directory' && (
              <TouristDirectory
                resorts={filteredResorts}
                allResorts={resorts}
                restaurants={restaurants}
                budgetHotels={budgetHotels}
                tourOperators={tourOperators}
                events={events}
                heroSlides={heroSlides}
                selectedLocation={selectedLocation}
                onResetLocation={() => setSelectedLocation('All Wayanad')}
                onSelectResort={handleOpenResortDetail}
                onSelectServiceDetail={handleOpenServiceDetail}
                directoryBanner={directoryBanner}
                selectedCompareIds={selectedCompareIds}
                onToggleCompare={handleToggleCompare}
                onClearCompare={() => {
                  setSelectedCompareIds([]);
                  setCompareModalOpen(false);
                }}
                onOpenCompare={() => setCompareModalOpen(true)}
              />
            )}

            {activeView === 'detail' && (
              <PropertyDetailView
                resort={activeDetailResort}
                dualSeoConfig={
                  dualSeoConfigs.find((c) => c.partnerId === activeDetailResort.id) ??
                  null
                }
                crossPromoAds={crossPromoAds}
                userRatings={
                  userRatingsByTarget[`resort:${activeDetailResort.id}`] ?? []
                }
                onSubmitRating={(entry) =>
                  handleAddUserRating(`resort:${activeDetailResort.id}`, entry)
                }
                onBackToDirectory={() => setActiveView('directory')}
                onSelectResort={handleOpenResortDetail}
              />
            )}

            {activeView === 'service_detail' && (
              <ServiceDetailView
                selection={activeServiceSelection}
                restaurants={restaurants}
                budgetHotels={budgetHotels}
                tourOperators={tourOperators}
                events={events}
                dualSeoConfig={
                  dualSeoConfigs.find(
                    (c) => c.partnerId === activeServiceSelection.id
                  ) ?? null
                }
                crossPromoAds={crossPromoAds}
                userRatings={
                  userRatingsByTarget[
                    `${activeServiceSelection.kind}:${activeServiceSelection.id}`
                  ] ?? []
                }
                onSubmitRating={(entry) =>
                  handleAddUserRating(
                    `${activeServiceSelection.kind}:${activeServiceSelection.id}`,
                    entry
                  )
                }
                onBackToDirectory={() => setActiveView('directory')}
                onSelectResort={handleOpenResortDetail}
              />
            )}

            {activeView === 'dashboard' && hasPartnerAccess && partnerAccount && (
              <OwnerDashboardView
                partnerAccount={partnerAccount}
                onLogout={handlePartnerLogout}
                resorts={resorts}
                ownerResortId={ownerResortId}
                onSelectOwnerResort={setOwnerResortId}
                seoOutput={seoOutput}
                hasOptimizedMeta={hasOptimizedMeta}
                checklistOverrides={{ schemaVerified }}
                onToggleSchemaChecklist={() => setSchemaVerified((prev) => !prev)}
                ownerSeoNotes={ownerSeoNotes}
                onChangeSeoNotes={setOwnerSeoNotes}
                onRunSeoOptimize={(notesOverride) => {
                  setAppliedSeoNotes(notesOverride ?? ownerSeoNotes);
                  setHasOptimizedMeta(true);
                }}
                adConfigs={adConfigs}
                onUpdateAdConfig={handleUpdateAdConfig}
                activeCampaignCount={activeCampaignCount}
                onPublishAds={handlePublishAds}
                onSaveListingDetails={handleSaveListingDetails}
                onPreviewLiveListing={handleOpenResortDetail}
                onPublishPartnerRecord={handlePublishPartnerRecord}
                onOpenPublishedDetail={(target) => {
                  if (target.kind === 'resort') {
                    handleOpenResortDetail(target.id);
                  } else {
                    handleOpenServiceDetail(target);
                  }
                }}
                apiOrigin={apiOrigin}
                onDualSeoConfigUpdated={handleDualSeoConfigUpdated}
              />
            )}

            {(activeView === 'login' ||
              (activeView === 'dashboard' && !hasPartnerAccess)) && (
              <LoginPageView
                onShowToast={showToast}
                onLoginSuccess={({ identifier, category }) => {
                  const trimmed = identifier.trim();
                  const looksLikeEmail = trimmed.includes('@');
                  setPartnerAccount({
                    name: 'Partner Owner',
                    businessName: ownerResort.name,
                    email: looksLikeEmail ? trimmed : '',
                    phone: !looksLikeEmail ? trimmed : ownerResort.whatsappNumber,
                    defaultCategory: category,
                  });
                  setActiveView('dashboard');
                  window.scrollTo({ top: 0, behavior: 'auto' });
                }}
                onSwitchToSignup={() => navigateToView('signup')}
              />
            )}

            {activeView === 'signup' && (
              <CreateAccountPageView
                onShowToast={showToast}
                onSignupSuccess={({ businessName, contact, category }) => {
                  const trimmedContact = contact.trim();
                  const looksLikeEmail = trimmedContact.includes('@');
                  setPartnerAccount({
                    name: businessName,
                    businessName,
                    email: looksLikeEmail ? trimmedContact : '',
                    phone: !looksLikeEmail ? trimmedContact : '',
                    defaultCategory: category,
                  });
                  setActiveView('dashboard');
                  window.scrollTo({ top: 0, behavior: 'auto' });
                }}
                onSwitchToLogin={() => navigateToView('login')}
              />
            )}
          </div>
        </LayoutGroup>
      </MotionConfig>

      <ResortCompareModal
        isOpen={compareModalOpen}
        allResorts={resorts}
        selectedIds={selectedCompareIds}
        onClose={() => setCompareModalOpen(false)}
        onRemoveResort={handleToggleCompare}
        onClearAll={() => {
          setSelectedCompareIds([]);
          setCompareModalOpen(false);
        }}
        onSelectResort={(resortId) => {
          setCompareModalOpen(false);
          handleOpenResortDetail(resortId);
        }}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          data-testid="auth-toast"
          className={`fixed left-4 right-4 sm:left-auto sm:right-5 z-50 sm:max-w-sm rounded-xl border border-[#065F46]/30 bg-white px-4 py-3 shadow-lg flex items-center gap-3 text-sm font-semibold text-[#0F172A] ${
            activeView === 'directory' && selectedCompareIds.length > 0
              ? 'bottom-20 sm:bottom-24'
              : 'bottom-4 sm:bottom-5'
          }`}
        >
          <span className="w-7 h-7 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="flex-1 leading-snug">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="text-[#64748B] hover:text-[#0F172A] p-1 rounded cursor-pointer focus-visible:outline-2 focus-visible:outline-[#065F46]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <footer className="border-t border-slate-200 bg-slate-50 mt-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-900">Wayngongo</span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span>
              Wayanad&apos;s direct-booking Tourism, Stays, Dining, Tours &amp; Fest Ticket platform
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => navigateToView('directory')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Explore Wayanad
            </button>
            <button
              type="button"
              onClick={() => navigateToView('detail')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Featured Stay
            </button>
            {hasPartnerAccess ? (
              <button
                type="button"
                onClick={() => navigateToView('dashboard')}
                className="font-semibold text-[#065F46] hover:underline cursor-pointer"
              >
                Partner Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigateToView('login')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Partner Log In
                </button>
                <button
                  type="button"
                  onClick={() => navigateToView('signup')}
                  className="font-semibold text-[#065F46] hover:underline cursor-pointer"
                >
                  Create Account / Register
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
