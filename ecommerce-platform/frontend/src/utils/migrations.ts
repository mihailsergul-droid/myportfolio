interface Migration {
  version: string;
  description: string;
  up: (data: any) => any;
  down: (data: any) => any;
}

const migrations: Migration[] = [
  {
    version: '1.0.1',
    description: 'Add SKU field to products',
    up: (data) => {
      if (data.products) {
        data.products = data.products.map((product: any, index: number) => ({
          ...product,
          sku: product.sku || `SKU${String(product.id || index + 1).padStart(3, '0')}`
        }));
      }
      return data;
    },
    down: (data) => {
      if (data.products) {
        data.products = data.products.map((product: any) => {
          const { sku, ...rest } = product;
          return rest;
        });
      }
      return data;
    }
  },
  {
    version: '1.0.2',
    description: 'Add image URLs to products',
    up: (data) => {
      if (data.products) {
        data.products = data.products.map((product: any) => ({
          ...product,
          image: product.image || `/images/${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
        }));
      }
      return data;
    },
    down: (data) => {
      if (data.products) {
        data.products = data.products.map((product: any) => {
          if (product.image?.startsWith('/images/')) {
            const { image, ...rest } = product;
            return rest;
          }
          return product;
        });
      }
      return data;
    }
  },
  {
    version: '1.1.0',
    description: 'Add order tracking and shipping info',
    up: (data) => {
      if (data.orders) {
        data.orders = data.orders.map((order: any) => ({
          ...order,
          tracking_number: order.tracking_number || `TRK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          shipping_address: order.shipping_address || {
            street: '',
            city: '',
            country: '',
            postal_code: ''
          },
          estimated_delivery: order.estimated_delivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }));
      }
      return data;
    },
    down: (data) => {
      if (data.orders) {
        data.orders = data.orders.map((order: any) => {
          const { tracking_number, shipping_address, estimated_delivery, ...rest } = order;
          return rest;
        });
      }
      return data;
    }
  }
];

export const migrateData = (data: any, targetVersion: string = '1.1.0'): any => {
  const currentVersion = data.version || '1.0.0';
  
  if (currentVersion === targetVersion) {
    return data;
  }
  
  let migratedData = { ...data };
  
  // Find migrations to apply
  const applicableMigrations = migrations.filter(m => 
    compareVersions(m.version, currentVersion) > 0 && 
    compareVersions(m.version, targetVersion) <= 0
  );
  
  // Apply migrations in order
  for (const migration of applicableMigrations) {
    migratedData.data = migration.up(migratedData.data);
    migratedData.version = migration.version;
  }
  
  return migratedData;
};

export const rollbackData = (data: any, targetVersion: string): any => {
  const currentVersion = data.version || '1.1.0';
  
  if (currentVersion === targetVersion) {
    return data;
  }
  
  let rolledBackData = { ...data };
  
  // Find migrations to rollback
  const rollbackMigrations = migrations.filter(m => 
    compareVersions(m.version, targetVersion) > 0 && 
    compareVersions(m.version, currentVersion) <= 0
  ).reverse();
  
  // Apply rollbacks in reverse order
  for (const migration of rollbackMigrations) {
    rolledBackData.data = migration.down(rolledBackData.data);
  }
  
  rolledBackData.version = targetVersion;
  return rolledBackData;
};

const compareVersions = (a: string, b: string): number => {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }
  
  return 0;
};

export { migrations };