// src/types/notifications.ts

export type NotificationType =
  | 'budget_alert'
  | 'transaction'
  | 'ai_insight'
  | 'system'
  | 'goal';

export type AlertCondition =
  | 'budget_exceed'
  | 'large_transaction'
  | 'monthly_summary'
  | 'low_balance'
  | 'goal_progress';

export interface Notification {
  id: string;
  firebase_uid: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface AlertRule {
  id: string;
  firebase_uid: string;
  name: string;
  condition: AlertCondition;
  threshold?: number;
  category?: string;
  channel: ('in_app' | 'email')[];
  enabled: boolean;
  created_at: string;
}

export interface NotificationPrefs {
  firebase_uid: string;
  in_app: boolean;
  email: boolean;
  budget_alerts: boolean;
  transaction_alerts: boolean;
  ai_insights: boolean;
  system_alerts: boolean;
  quiet_hours_start?: number | null;
  quiet_hours_end?: number | null;
}