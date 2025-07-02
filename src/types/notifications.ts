
export interface NotificationData {
  sent_by?: string;
  assigned_by?: string;
  sender_name?: string;
  new_role?: string;
  requires_verification?: boolean;
  target_role?: string;
  priority?: string;
  category?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  user_id?: string | null;
  read: boolean | null;
  data?: NotificationData | null;
  created_at: string | null;
}

export interface AdminNotification extends Notification {
  target_role: string | null;
}

// Helper function to safely convert Json to NotificationData
export const parseNotificationData = (data: any): NotificationData | null => {
  if (!data) return null;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return data as NotificationData;
};
