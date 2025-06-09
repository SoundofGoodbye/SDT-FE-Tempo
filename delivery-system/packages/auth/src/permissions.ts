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

  // Product permissions
  PRODUCT_CREATE: 'product:create',
  PRODUCT_EDIT: 'product:edit',
  PRODUCT_DELETE: 'product:delete',
  PRODUCT_VIEW: 'product:view',
  PRODUCT_IMPORT: 'product:import',

  // Delivery permissions
  DELIVERY_VIEW_ALL: 'delivery:view:all',
  DELIVERY_VIEW_ASSIGNED: 'delivery:view:assigned',
  DELIVERY_UPDATE: 'delivery:update',
  DELIVERY_ASSIGN: 'delivery:assign',

  // Settings permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    // Admins have all permissions
    ...Object.values(PERMISSIONS)
  ],

  [ROLES.MANAGER]: [
    // Company - view only their assigned company
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.COMPANY_EDIT,

    // Shops - full control within their company
    PERMISSIONS.SHOP_CREATE,
    PERMISSIONS.SHOP_EDIT,
    PERMISSIONS.SHOP_DELETE,
    PERMISSIONS.SHOP_VIEW,

    // Users - manage users in their company
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_VIEW,

    // Products - full control
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_IMPORT,

    // Deliveries - view all in their company
    PERMISSIONS.DELIVERY_VIEW_ALL,
    PERMISSIONS.DELIVERY_ASSIGN,

    // Settings
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
  ],

  [ROLES.SHOP_ASSISTANT]: [
    // Limited to their shop
    PERMISSIONS.SHOP_VIEW,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.DELIVERY_VIEW_ALL,
    PERMISSIONS.DELIVERY_UPDATE,
  ],

  [ROLES.DELIVERY_GUY]: [
    // Only their assigned deliveries
    PERMISSIONS.DELIVERY_VIEW_ASSIGNED,
    PERMISSIONS.DELIVERY_UPDATE,
  ]
};
