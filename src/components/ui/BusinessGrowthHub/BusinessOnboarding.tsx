import React, { useState } from "react";
import { BusinessProfileService } from "@/services/business/BusinessProfileService";
import type { BusinessProfile } from "@/services/business/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

export function BusinessOnboarding({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({});

  const handleNext = () => setStep((s) => s + 1);

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await BusinessProfileService.upsertProfile({
        ...profile,
        firebase_uid: user.uid,
      });
      toast.success("Business profile saved!");
      onComplete();
    } catch (e) {
      toast.error("Failed to save business profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
      <h2 className="text-2xl font-semibold mb-6 tracking-tight">Business Setup</h2>
      
      {step === 0 && (
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
          <label className="block text-sm font-medium text-text-secondary">What kind of business do you run?</label>
          <input
            type="text"
            placeholder="e.g. Grocery Store, Clothing Shop, Freelancer"
            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            value={profile.business_type || ""}
            onChange={(e) => setProfile({ ...profile, business_type: e.target.value })}
          />
          <button
            onClick={handleNext}
            disabled={!profile.business_type}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl py-3 font-medium transition-all"
          >
            Next <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
          <label className="block text-sm font-medium text-text-secondary">How do you operate?</label>
          <div className="grid grid-cols-2 gap-3">
            {['Retail', 'Wholesale', 'Service', 'Mixed'].map((model) => (
              <button
                key={model}
                onClick={() => setProfile({ ...profile, operating_model: model })}
                className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                  profile.operating_model === model 
                    ? "border-violet-500 bg-violet-500/20 text-violet-300" 
                    : "border-white/10 hover:border-white/20 text-text-secondary"
                }`}
              >
                {model}
              </button>
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={!profile.operating_model}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl py-3 font-medium transition-all mt-4"
          >
            Next <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-secondary">Do you keep inventory?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="inventory" onChange={() => setProfile({ ...profile, uses_inventory: 'KNOWN' })} /> Yes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="inventory" onChange={() => setProfile({ ...profile, uses_inventory: 'NOT_APPLICABLE' })} /> No
              </label>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-secondary">Do customers buy on credit?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="credit" onChange={() => setProfile({ ...profile, offers_customer_credit: 'KNOWN' })} /> Yes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="credit" onChange={() => setProfile({ ...profile, offers_customer_credit: 'NOT_APPLICABLE' })} /> No
              </label>
            </div>
          </div>

          <button
            onClick={handleFinish}
            disabled={loading || !profile.uses_inventory || !profile.offers_customer_credit}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl py-3 font-medium transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Finish Setup"}
          </button>
        </div>
      )}
    </div>
  );
}
