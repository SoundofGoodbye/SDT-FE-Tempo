export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  DELIVERY_GUY: 'DELIVERY_GUY',
  SHOP_ASSISTANT: 'SHOP_ASSISTANT'
} as const;

export const PERMISSIONS = {
  // Company permissions
  COMPANY_CREATE: 'company:create',
  COMPANY_EDIT: 'company:edit',
  COMPANY_DELETE: 'company:delete',
  COMPANY_VIEW: 'company:view',
  
  // Shop permissions
  SHOP_CREATE: 'shop:create',
  SHOP_EDIT: 'shop:edit',
  SHOP_DELETE: 'shop:delete',
  SHOP_VIEW: 'shop:view',
  
  // User permissions
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_VIEW: 'user:view',
  
  // Delivery permissions
  DELIVERY_VIEW_ALL: 'delivery:view:all',
  DELIVERY_VIEW_ASSIGNED: 'delivery:view:assigned',
  DELIVERY_UPDATE: 'delivery:update',
  DELIVERY_ASSIGN: 'delivery:assign'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
