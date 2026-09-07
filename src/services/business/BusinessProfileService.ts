import { supabase } from "@/lib/supabase";
import type { BusinessProfile, BusinessResponse } from "./types";

export class BusinessProfileService {
  /**
   * Fetches the business profile for a given user.
   */
  static async getProfile(uid: string): Promise<BusinessResponse<BusinessProfile | null>> {
    try {
      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("firebase_uid", uid)
        .maybeSingle();

      if (error) throw error;

      return {
        data: data as BusinessProfile | null,
        meta: {
          sourceCount: data ? 1 : 0,
          dataQuality: data?.readiness_state as any || 'NOT_READY',
          lastUpdated: data?.updated_at || new Date().toISOString(),
        }
      };
    } catch (err) {
      console.error("[BusinessProfileService.getProfile] Error:", err);
      return {
        data: null,
        meta: { sourceCount: 0, dataQuality: 'NOT_READY', lastUpdated: new Date().toISOString() }
      };
    }
  }

  /**
   * Upserts a business profile for a given user.
   */
  static async upsertProfile(profile: Partial<BusinessProfile> & { firebase_uid: string }): Promise<BusinessResponse<BusinessProfile | null>> {
    try {
      // Determine readiness state based on filled fields
      const filledFieldsCount = Object.values(profile).filter(v => v !== undefined && v !== null && v !== "").length;
      let readiness = 'NOT_READY';
      if (filledFieldsCount > 15) readiness = 'HIGH_CONFIDENCE';
      else if (filledFieldsCount > 10) readiness = 'READY';
      else if (filledFieldsCount > 5) readiness = 'PARTIALLY_READY';

      const payload = {
        ...profile,
        readiness_state: readiness,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("business_profiles")
        .upsert(payload, { onConflict: "firebase_uid" })
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as BusinessProfile,
        meta: {
          sourceCount: 1,
          dataQuality: data.readiness_state as any || 'NOT_READY',
          lastUpdated: data.updated_at,
        }
      };
    } catch (err) {
      console.error("[BusinessProfileService.upsertProfile] Error:", err);
      return {
        data: null,
        meta: { sourceCount: 0, dataQuality: 'NOT_READY', lastUpdated: new Date().toISOString() }
      };
    }
  }
}
