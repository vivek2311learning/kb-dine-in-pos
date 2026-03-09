export type TableStatus = 'free' | 'occupied';

export type OrderStatus = 'running' | 'billed' | 'paid' | 'closed' | 'refunded';

export type KitchenStatus =
  | 'draft'
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'served';

export type PaymentMethod = 'cash' | 'upi' | 'card';

export type MenuStatus = 'draft' | 'active' | 'unavailable' | 'archived';
