import { BusinessProfileService } from "./BusinessProfileService";
import { BusinessTransactionService } from "./BusinessTransactionService";
import { BusinessEntityService } from "./BusinessEntityService";
import type { BusinessSnapshotData, DataCompletenessData, BusinessResponse } from "./types";

export class BusinessSnapshotService {
  /**
   * Generates the business health snapshot based on available data.
   */
  static async getSnapshot(uid: string, businessId: string): Promise<BusinessResponse<BusinessSnapshotData>> {
    // In a real scenario, this would aggregate data from business_transactions, business_receivables, etc.
    // For Phase 1, we pull what exists and default the rest to 0 / low confidence.
    
    try {
      const { data: txs } = await BusinessTransactionService.getBusinessTransactions(uid);
      const { data: receivables } = await BusinessEntityService.getReceivables(uid);
      const { data: payables } = await BusinessEntityService.getPayables(uid);
      const { data: inventory } = await BusinessEntityService.getProducts(uid);

      let monthlyRevenue = 0;
      let estimatedDirectCosts = 0;
      let knownOperatingExpenses = 0;
      
      if (txs && txs.length > 0) {
        // Aggregate logic
        // This is simplified. Normally we would join with public.transactions for amounts.
      }

      const totalReceivables = (receivables || []).reduce((acc, curr) => acc + (curr.amount_outstanding || 0), 0);
      const totalPayables = (payables || []).reduce((acc, curr) => acc + (curr.amount_outstanding || 0), 0);
      const totalInventory = (inventory || []).reduce((acc, curr) => acc + (curr.stock_value || 0), 0);

      const data: BusinessSnapshotData = {
        monthlyRevenue,
        monthlyRevenueConfidence: txs?.length ? 0.8 : 0,
        estimatedDirectCosts,
        estimatedDirectCostsConfidence: txs?.length ? 0.6 : 0,
        knownOperatingExpenses,
        knownOperatingExpensesConfidence: txs?.length ? 0.7 : 0,
        knownBusinessCash: 0,
        knownBusinessCashConfidence: 0,
        outstandingReceivables: totalReceivables,
        outstandingReceivablesConfidence: receivables?.length ? 0.9 : 0,
        outstandingPayables: totalPayables,
        outstandingPayablesConfidence: payables?.length ? 0.9 : 0,
        inventoryValue: totalInventory,
        inventoryValueConfidence: inventory?.length ? 0.8 : 0,
        recurringCommitments: 0,
        recurringCommitmentsConfidence: 0,
      };

      return {
        data,
        meta: { sourceCount: 4, dataQuality: 'PARTIALLY_READY', lastUpdated: new Date().toISOString() }
      };
    } catch (err) {
      console.error("[BusinessSnapshotService.getSnapshot] Error:", err);
      throw err;
    }
  }

  /**
   * Evaluates the completeness of the business foundation data.
   */
  static async getDataCompleteness(uid: string): Promise<BusinessResponse<DataCompletenessData>> {
    try {
      const { data: profile } = await BusinessProfileService.getProfile(uid);
      const { data: txs } = await BusinessTransactionService.getBusinessTransactions(uid);
      const { data: inventory } = await BusinessEntityService.getProducts(uid);
      const { data: suppliers } = await BusinessEntityService.getSuppliers(uid);
      const { data: customers } = await BusinessEntityService.getCustomers(uid);

      const hasIdentity = !!profile && !!profile.business_name;
      const hasTxs = !!txs && txs.length > 0;

      const data: DataCompletenessData = {
        businessIdentity: hasIdentity,
        revenueData: hasTxs,
        expenseData: hasTxs,
        inventoryData: profile?.uses_inventory === 'NOT_APPLICABLE' ? 100 : (inventory?.length ? 80 : 0),
        supplierData: suppliers?.length ? 60 : 0,
        customerData: customers?.length ? 40 : 0,
        receivables: 0,
        payables: 0,
        cashData: false,
        seasonality: profile?.seasonality?.length ? 100 : 0,
      };

      return {
        data,
        meta: { sourceCount: 5, dataQuality: 'READY', lastUpdated: new Date().toISOString() }
      };
    } catch (err) {
      console.error("[BusinessSnapshotService.getDataCompleteness] Error:", err);
      throw err;
    }
  }
}
