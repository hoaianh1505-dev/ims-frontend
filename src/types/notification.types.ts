export type NotificationType =
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'STOCK_TRANSACTION'
  | 'SYSTEM';

export type NotificationSeverity = 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS';

export interface AppNotification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface FilterNotificationParams {
  page?: number;
  limit?: number;
  is_read?: boolean;
  type?: NotificationType;
  severity?: NotificationSeverity;
  search?: string;
}

export interface PaginatedNotificationsResponse {
  data: AppNotification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

