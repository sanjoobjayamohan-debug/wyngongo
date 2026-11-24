import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronRight, LayoutDashboard, LogOut, MapPin, Trees } from 'lucide-react';
import type {
  AppView,
  PartnerAccount,
  WeeklyDeal,
  WayanadLocation,
} from '../types/resort';
import { WAYANAD_LOCATIONS } from '../data/mockWayanadData';

interface NavbarProps {
  activeView: AppView;
  partnerAccount: PartnerAccount | null;
  onSelectView: (view: AppView) => void;
  onLogout: () => void;
  selectedLocation: WayanadLocation;
  onSelectLocation: (location: WayanadLocation) => void;
  weeklyDeals: WeeklyDeal[];
  onSelectDealResort: (resortId: string) => void;
  filteredCount: number;
}

export function Navbar({
  activeView,
  partnerAccount,
  onSelectView,
  onLogout,
  selectedLocation,
  onSelectLocation,
  weeklyDeals,
  onSelectDealResort,
  filteredCount,
}: NavbarProps) {
  const [dealsOpen, setDealsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDealsOpen(false);
      }
    }
    if (dealsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dealsOpen]);

  return (
    <header className="bg-white border-b border-slate-200/80">
      {/* Sticky Main Header Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-[1360px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => onSelectView('directory')}
            className="flex items-center gap-1.5 sm:gap-2.5 text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800 rounded"
          >
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#065F46] text-white flex items-center justify-center shrink-0">
              <Trees className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <span className="text-[15px] sm:text-lg font-bold tracking-tight text-slate-900 leading-none">
                Wayngongo
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-slate-500 mt-0.5">
                Wayanad Stays · Dining · Tours · Fests
              </span>
            </div>
          </button>

          {/* Zone 2: Weekly Deals Bell + Strict Auth / Partner Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDealsOpen((prev) => !prev)}
                aria-expanded={dealsOpen}
                aria-haspopup="menu"
                aria-label={`Active weekly Wayanad deals (${weeklyDeals.length})`}
                className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#065F46]"
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-600 text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                  {weeklyDeals.length}
                </span>
              </button>

              {dealsOpen && (
                <div
                  role="menu"
                  aria-label="Active weekly Wayanad deals"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <span className="text-xs font-semibold text-slate-900">
                      Active Weekly Wayanad Deals
                    </span>
                    <span className="text-xs font-medium text-amber-700 tabular-nums">
                      {weeklyDeals.length} live offers
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {weeklyDeals.map((deal) => (
                      <button
                        key={deal.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onSelectDealResort(deal.resortId);
                          setDealsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="font-semibold text-slate-900 truncate">
                              {deal.resortName}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{deal.location}</span>
                          </div>
                          <p className="text-xs font-medium text-emerald-900 mt-1">
                            {deal.dealTitle}
                          </p>
                          <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
                            {deal.validUntil}
                          </p>
                        </div>
                        <ChevronRight
                          className="w-4 h-4 text-slate-400 shrink-0 mt-1"
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {partnerAccount ? (
              <>
                <button
                  type="button"
                  data-testid="nav-partner-dashboard-btn"
                  onClick={() => onSelectView('dashboard')}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46] ${
                    activeView === 'dashboard'
                      ? 'border-[#065F46] bg-[#065F46] text-white'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">Partner Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </button>
                <button
                  type="button"
                  data-testid="nav-logout-btn"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46]"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  data-testid="nav-partner-login-btn"
                  onClick={() => onSelectView('login')}
                  className={`px-2.5 sm:px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors motion-reduce:transition-none whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46] ${
                    activeView === 'login'
                      ? 'border-[#065F46] bg-[#D1FAE5] text-[#065F46]'
                      : 'border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#0F172A]'
                  }`}
                >
                  Partner Log In
                </button>

                <button
                  type="button"
                  data-testid="nav-partner-register-btn"
                  onClick={() => onSelectView('signup')}
                  className={`px-2.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-colors motion-reduce:transition-none whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46] ${
                    activeView === 'signup'
                      ? 'bg-[#044E3A] text-white ring-2 ring-[#065F46]/30'
                      : 'bg-[#065F46] text-white hover:bg-[#044E3A]'
                  }`}
                >
                  <span className="hidden sm:inline">Create Account / Register</span>
                  <span className="sm:hidden">Register</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Location Filter Pills Strip (shown on Tourist Directory) */}
      {activeView === 'directory' && (
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-2 overflow-x-auto no-scrollbar"
            role="group"
            aria-label="Filter listings by Wayanad region"
          >
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-500 mr-1 whitespace-nowrap shrink-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-800" aria-hidden="true" />
              Region:
            </span>
            {WAYANAD_LOCATIONS.map((loc) => {
              const active = selectedLocation === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectLocation(loc)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-800 ${
                    active
                      ? 'bg-emerald-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap shrink-0 tabular-nums">
            <span>{filteredCount} verified stays</span>
            <span aria-hidden="true">·</span>
            <span>Zero commission · Direct WhatsApp &amp; UPI</span>
          </div>
        </div>
      )}
    </header>
  );
}
