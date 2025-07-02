
export interface RoleBasedNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  recipient_role: 'owner' | 'admin' | 'franchise' | 'all';
  recipient_id?: string;
  sender_role?: string;
  sender_name?: string;
  read: boolean;
  created_at: string;
  data?: any;
}

export type UserRole = 'owner' | 'admin' | 'franchise' | 'customer';
export type RecipientRole = 'owner' | 'admin' | 'franchise' | 'all';
