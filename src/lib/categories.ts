import type { AppMode } from "@/context/AppModeContext";

export const BUSINESS_CATEGORIES = [
  "Sales",
  "Inventory/Purchases",
  "Wholesale/Mal",
  "Employee Salary",
  "Rent",
  "Utilities",
  "Transport",
  "Marketing",
  "Other",
];

export const PERSONAL_CATEGORIES = [
  "Income",
  "Subscription",
  "Food",
  "Shopping",
  "Utilities",
  "Transport",
  "Health",
  "Entertainment",
  "Other",
];

export function getCategories(mode: AppMode) {
  return mode === "BUSINESS" ? BUSINESS_CATEGORIES : PERSONAL_CATEGORIES;
}
