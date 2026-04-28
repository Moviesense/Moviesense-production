export interface Notification {
  _id: string;
  userId?: string;
  title: string;
  message: string;
  image?: string;
  deepLink?: string;
  viewed: boolean;
  date?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationResponse {
  status: boolean;
  message: string;
  notification: Notification[];
}
