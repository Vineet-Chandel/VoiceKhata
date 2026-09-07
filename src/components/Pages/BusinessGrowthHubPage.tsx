import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BusinessProfileService } from "@/services/business/BusinessProfileService";
import { BusinessSnapshotService } from "@/services/business/BusinessSnapshotService";
import type { BusinessProfile, BusinessSnapshotData, DataCompletenessData } from "@/services/business/types";
import { Loader2 } from "lucide-react";

import { BusinessOnboarding } from "@/components/ui/BusinessGrowthHub/BusinessOnboarding";
import { BusinessSnapshot } from "@/components/ui/BusinessGrowthHub/BusinessSnapshot";
import { DataCompleteness } from "@/components/ui/BusinessGrowthHub/DataCompleteness";

export default function BusinessGrowthHubPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [snapshot, setSnapshot] = useState<BusinessSnapshotData | null>(null);
  const [completeness, setCompleteness] = useState<DataCompletenessData | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
          <Loader2 size={48} className="animate-spin text-violet-500 relative z-10" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mt-4">Loading Business Digital Twin...</h2>
      </div>
    );
  }

  // If no business profile exists, show the onboarding flow
  if (!profile || !profile.business_name && !profile.operating_model) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 md:px-8">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">Business Growth Hub</h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Before we can optimize your business, we need to understand it. Let's set up your business foundation.
          </p>
        </div>
        <BusinessOnboarding onComplete={loadData} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">Business Growth Hub</h1>
          <p className="text-text-secondary text-sm max-w-lg">
            Your Trustworthy Business Foundation. We track what you sell, who you owe, and how your money moves.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium">
            Readiness: <span className="text-violet-400 ml-1">{profile.readiness_state?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

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
  );
}
