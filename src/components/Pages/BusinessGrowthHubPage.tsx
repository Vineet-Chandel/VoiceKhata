import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BusinessProfileService } from "@/services/business/BusinessProfileService";
import { BusinessSnapshotService } from "@/services/business/BusinessSnapshotService";
import type { BusinessProfile, BusinessSnapshotData, DataCompletenessData } from "@/services/business/types";
import { Loader2, Sparkles, ChevronDown, ChevronUp, Store, RefreshCw } from "lucide-react";

// Money Growth Center components
import { useMoneyGrowth } from "@/components/hooks/use-money-growth";
import { FinancialHealth } from "@/components/ui/MoneyGrowthCenter/FinancialHealth";
import { NextBestMove } from "@/components/ui/MoneyGrowthCenter/NextBestMove";
import { MoneyMoments } from "@/components/ui/MoneyGrowthCenter/MoneyMoments";
import { MoneyFlow } from "@/components/ui/MoneyGrowthCenter/MoneyFlow";
import { RupeeRouter } from "@/components/ui/MoneyGrowthCenter/RupeeRouter";
import { WhatIfSimulator } from "@/components/ui/MoneyGrowthCenter/WhatIfSimulator";
import { CanIAffordThis } from "@/components/ui/MoneyGrowthCenter/CanIAffordThis";
import { BusinessCommandCenter } from "@/components/ui/MoneyGrowthCenter/BusinessCommandCenter";

// Business Growth Hub components
import { BusinessOnboarding } from "@/components/ui/BusinessGrowthHub/BusinessOnboarding";
import { BusinessSnapshot } from "@/components/ui/BusinessGrowthHub/BusinessSnapshot";
import { DataCompleteness } from "@/components/ui/BusinessGrowthHub/DataCompleteness";

export default function BusinessGrowthHubPage() {
  const { user } = useAuth();

  // ── Money Growth Engine ────────────────────────────────────────────────────
  const { data: growthData, loading: growthLoading, refresh } = useMoneyGrowth();

  // ── Business Profile ───────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [snapshot, setSnapshot] = useState<BusinessSnapshotData | null>(null);
  const [completeness, setCompleteness] = useState<DataCompletenessData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [businessHubExpanded, setBusinessHubExpanded] = useState(false);

  const loadBusinessData = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const profileRes = await BusinessProfileService.getProfile(user.uid);
      setProfile(profileRes.data);

      if (profileRes.data && profileRes.data.id) {
        const snapRes = await BusinessSnapshotService.getSnapshot(user.uid, profileRes.data.id);
        setSnapshot(snapRes.data);

        const compRes = await BusinessSnapshotService.getDataCompleteness(user.uid);
        setCompleteness(compRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadBusinessData();
  }, [user]);

  const hasBusinessProfile = profile && (profile.business_name || profile.operating_model);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    loadBusinessData();
    refresh();
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (growthLoading && !growthData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
          <Loader2 size={48} className="animate-spin text-violet-500 relative z-10" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mt-4">Building Your Financial Digital Twin...</h2>
        <p className="text-sm text-text-muted">Analyzing your transactions and generating intelligence</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="text-violet-400" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">AI Money Growth Center</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">Engine</span>
            </div>
            <p className="text-text-secondary text-sm max-w-lg">
              Your Financial Digital Twin — real-time intelligence on health, growth, and next best moves.
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={growthLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={growthLoading ? "animate-spin" : ""} />
          Refresh Intelligence
        </button>
      </div>

      {/* ── Money Growth Engine Content ──────────────────────────────────────── */}
      {growthData ? (
        <>
          {/* Next Best Move — the hero card */}
          <NextBestMove data={growthData.nextBestMove} />

          {/* Financial Health */}
          <FinancialHealth health={growthData.financialHealth} />

          {/* Money Moments */}
          <MoneyMoments moments={growthData.moneyMoments} />

          {/* Two-column layout for Money Flow & Rupee Router */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MoneyFlow flow={growthData.moneyFlow} />
            <RupeeRouter router={growthData.rupeeRouter} />
          </div>

          {/* What-If Simulator & Can I Afford This */}
          <WhatIfSimulator />
          <CanIAffordThis />

          {/* Business Command Center — only shows if business transactions detected */}
          <BusinessCommandCenter business={growthData.businessCommandCenter} />
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-muted text-sm">No financial data available yet. Start adding transactions to power your growth engine.</p>
        </div>
      )}

      {/* ── Business Growth Hub Section ─────────────────────────────────────── */}
      <div className="mt-8">
        {/* Onboarding banner if no business profile */}
        {!hasBusinessProfile && !showOnboarding && !profileLoading && (
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-violet-500/5 to-transparent p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Store className="text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Run a business?</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Set up your Business Growth Hub to unlock shopkeeper intelligence, supplier tracking, and business-specific insights.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowOnboarding(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shrink-0"
            >
              Set Up Business
            </button>
          </div>
        )}

        {/* Onboarding wizard */}
        {showOnboarding && (
          <div className="mb-6">
            <BusinessOnboarding onComplete={handleOnboardingComplete} />
          </div>
        )}

        {/* Business Hub — collapsible section when profile exists */}
        {hasBusinessProfile && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <button
              onClick={() => setBusinessHubExpanded(!businessHubExpanded)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Store size={18} className="text-blue-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-text-primary">Business Growth Hub</h2>
                  <p className="text-sm text-text-muted">
                    Readiness: <span className="text-violet-400 ml-1">{profile?.readiness_state?.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>
              {businessHubExpanded ? (
                <ChevronUp size={20} className="text-text-muted" />
              ) : (
                <ChevronDown size={20} className="text-text-muted" />
              )}
            </button>

            {businessHubExpanded && (
              <div className="px-5 pb-6 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {snapshot && <BusinessSnapshot data={snapshot} />}

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                      <h3 className="text-lg font-semibold text-text-primary mb-2">How is your money being used?</h3>
                      <p className="text-sm text-text-muted mb-4">
                        Categorize your transactions to separate Business expenses from Personal and Owner Withdrawals.
                      </p>
                      {/* Classification UI Placeholder */}
                      <div className="p-4 border border-white/5 rounded-xl bg-background/50 text-center text-sm text-text-secondary">
                        Transaction classification module goes here.
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    {completeness && <DataCompleteness data={completeness} />}

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                      <h3 className="text-lg font-semibold text-text-primary mb-2">How your money moves</h3>
                      <div className="flex flex-col gap-3 text-sm text-text-secondary">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span>Customers</span>
                          <span>0</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span>Suppliers</span>
                          <span>0</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span>Products</span>
                          <span>0</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span>Connected Accounts</span>
                          <span>1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
