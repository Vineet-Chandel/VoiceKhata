import { supabase } from "@/lib/supabase";
import type { BusinessTransaction, BusinessResponse } from "./types";
import type { Transaction } from "@/types/finance";

export class BusinessTransactionService {
  /**
   * Links raw transactions to business transactions with classifications.
   * In a full implementation, this could use an LLM or heuristics.
   */
  static async classifyTransactions(
    uid: string, 
    businessId: string, 
    rawTransactions: Transaction[]
  ): Promise<BusinessResponse<BusinessTransaction[]>> {
    try {
      const businessKeywords = ['supplier', 'vendor', 'invoice', 'stock', 'customer', 'sale', 'pos'];
      
      const newClassifications: Partial<BusinessTransaction>[] = rawTransactions.map(tx => {
        let classification = 'UNKNOWN';
        let confidence = 0.5;
        let reason = 'Unable to determine from heuristics';

        const text = `${tx.transaction} ${tx.category}`.toLowerCase();
        
        if (businessKeywords.some(kw => text.includes(kw))) {
          classification = 'BUSINESS';
          confidence = 0.8;
          reason = 'Matches known business keywords';
        } else if (text.includes('salary') || text.includes('grocery') || text.includes('movie')) {
          classification = 'PERSONAL';
          confidence = 0.7;
          reason = 'Matches known personal keywords';
        } else if (text.includes('draw') || text.includes('withdrawal')) {
          classification = 'OWNER_DRAW';
          confidence = 0.6;
          reason = 'Matches owner withdrawal pattern';
        }

        return {
          firebase_uid: uid,
          business_id: businessId,
          transaction_id: tx.id,
          classification: classification as any,
          confidence,
          reason,
          business_category: classification === 'BUSINESS' && tx.type === 'Credit' ? 'Revenue' : 
                             classification === 'BUSINESS' && tx.type === 'Debit' ? 'Operating Expenses' : undefined
        };
      });

      const { data, error } = await supabase
        .from('business_transactions')
        .upsert(newClassifications, { onConflict: 'transaction_id' })
        .select();

      if (error) throw error;

      return {
        data: data as BusinessTransaction[],
        meta: {
          sourceCount: data.length,
          dataQuality: 'PARTIALLY_READY',
          lastUpdated: new Date().toISOString()
        }
      };

    } catch (err) {
      console.error("[BusinessTransactionService.classifyTransactions] Error:", err);
      return {
        data: [],
        meta: { sourceCount: 0, dataQuality: 'NOT_READY', lastUpdated: new Date().toISOString() }
      };
    }
  }

  /**
   * Fetches classified business transactions.
   */
  static async getBusinessTransactions(uid: string): Promise<BusinessResponse<BusinessTransaction[]>> {
    try {
      const { data, error } = await supabase
        .from('business_transactions')
        .select('*')
        .eq('firebase_uid', uid);

      if (error) throw error;

      return {
        data: data as BusinessTransaction[],
        meta: {
          sourceCount: data.length,
          dataQuality: data.length > 0 ? 'READY' : 'NOT_READY',
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (err) {
      console.error("[BusinessTransactionService.getBusinessTransactions] Error:", err);
      return {
        data: [],
        meta: { sourceCount: 0, dataQuality: 'NOT_READY', lastUpdated: new Date().toISOString() }
      };
    }
  }
}
