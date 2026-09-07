import { supabase } from "@/lib/supabase";
import type { 
  BusinessCustomer, 
  BusinessSupplier, 
  BusinessProduct, 
  BusinessReceivable, 
  BusinessPayable,
  BusinessResponse 
} from "./types";

export class BusinessEntityService {
  /** Customers */
  static async getCustomers(uid: string): Promise<BusinessResponse<BusinessCustomer[]>> {
    const { data, error } = await supabase.from('business_customers').select('*').eq('firebase_uid', uid);
    if (error) throw error;
    return { data: data as BusinessCustomer[], meta: { sourceCount: data.length, dataQuality: 'READY', lastUpdated: new Date().toISOString() } };
  }

  /** Suppliers */
  static async getSuppliers(uid: string): Promise<BusinessResponse<BusinessSupplier[]>> {
    const { data, error } = await supabase.from('business_suppliers').select('*').eq('firebase_uid', uid);
    if (error) throw error;
    return { data: data as BusinessSupplier[], meta: { sourceCount: data.length, dataQuality: 'READY', lastUpdated: new Date().toISOString() } };
  }

  /** Products / Inventory */
  static async getProducts(uid: string): Promise<BusinessResponse<BusinessProduct[]>> {
    const { data, error } = await supabase.from('business_products').select('*').eq('firebase_uid', uid);
    if (error) throw error;
    return { data: data as BusinessProduct[], meta: { sourceCount: data.length, dataQuality: 'READY', lastUpdated: new Date().toISOString() } };
  }

  /** Receivables */
  static async getReceivables(uid: string): Promise<BusinessResponse<BusinessReceivable[]>> {
    const { data, error } = await supabase.from('business_receivables').select('*').eq('firebase_uid', uid);
    if (error) throw error;
    return { data: data as BusinessReceivable[], meta: { sourceCount: data.length, dataQuality: 'READY', lastUpdated: new Date().toISOString() } };
  }

  /** Payables */
  static async getPayables(uid: string): Promise<BusinessResponse<BusinessPayable[]>> {
    const { data, error } = await supabase.from('business_payables').select('*').eq('firebase_uid', uid);
    if (error) throw error;
    return { data: data as BusinessPayable[], meta: { sourceCount: data.length, dataQuality: 'READY', lastUpdated: new Date().toISOString() } };
  }
}
