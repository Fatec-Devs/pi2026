// Run this file with mongosh connected to your MongoDB Atlas cluster.
// Example:
// mongosh "mongodb+srv://<user>:<password>@<cluster>/admin" --file MongoScript/scripts.js

const dbName = 'pi-app-2026';
const appDb = db.getSiblingDB(dbName);

function ensureCollection(name, options = {}) {
  if (!appDb.getCollectionNames().includes(name)) {
    appDb.createCollection(name, options);
  }
}

ensureCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'passwordHash', 'role', 'active'],
      properties: {
        name: { bsonType: 'string' },
        email: { bsonType: 'string' },
        passwordHash: { bsonType: 'string' },
        role: { enum: ['ADMIN', 'CLIENT'] },
        phone: { bsonType: 'string' },
        active: { bsonType: 'bool' },
      },
    },
  },
});

ensureCollection('clients', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      properties: {
        userId: { bsonType: 'objectId' },
        document: { bsonType: 'string' },
        address: { bsonType: 'string' },
        notes: { bsonType: 'string' },
      },
    },
  },
});

ensureCollection('machines', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'status', 'active'],
      properties: {
        name: { bsonType: 'string' },
        brand: { bsonType: 'string' },
        model: { bsonType: 'string' },
        serialNumber: { bsonType: 'string' },
        location: { bsonType: 'string' },
        notes: { bsonType: 'string' },
        status: { enum: ['ATIVO', 'INATIVO', 'EM_MANUTENCAO'] },
        active: { bsonType: 'bool' },
      },
    },
  },
});

ensureCollection('serviceorders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['clientId', 'machineId', 'status', 'services', 'laborCost', 'partsCost', 'totalCost'],
      properties: {
        clientId: { bsonType: 'objectId' },
        machineId: { bsonType: 'objectId' },
        status: { enum: ['ORCAMENTO', 'APROVADO', 'EM_EXECUCAO', 'CONCLUIDO'] },
        services: { bsonType: 'array', minItems: 1 },
        materials: { bsonType: 'array' },
        laborCost: { bsonType: ['double', 'int', 'long', 'decimal'], minimum: 0 },
        partsCost: { bsonType: ['double', 'int', 'long', 'decimal'], minimum: 0 },
        totalCost: { bsonType: ['double', 'int', 'long', 'decimal'], minimum: 0 },
        notes: { bsonType: 'string' },
        approvedAt: { bsonType: 'date' },
        startedAt: { bsonType: 'date' },
        finishedAt: { bsonType: 'date' },
        stockAdjustmentStatus: { enum: ['PENDING', 'APPLIED', 'FAILED'] },
      },
    },
  },
});

ensureCollection('inventoryitems', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'sku', 'unit', 'quantity', 'minStock', 'unitCost', 'active'],
      properties: {
        name: { bsonType: 'string' },
        sku: { bsonType: 'string' },
        unit: { bsonType: 'string' },
        quantity: { bsonType: ['double', 'int', 'long', 'decimal'], minimum: 0 },
        minStock: { bsonType: ['double', 'int', 'long', 'decimal'], minimum: 0 },
        unitCost: { bsonType: ['double', 'int', 'long', 'decimal'], minimum: 0 },
        active: { bsonType: 'bool' },
      },
    },
  },
});

ensureCollection('financialentries', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['type', 'description', 'amount', 'date', 'category'],
      properties: {
        serviceOrderId: { bsonType: 'objectId' },
        type: { enum: ['INCOME', 'EXPENSE'] },
        description: { bsonType: 'string' },
        amount: { bsonType: ['double', 'int', 'long', 'decimal'], minimum: 0 },
        date: { bsonType: 'date' },
        category: { bsonType: 'string' },
      },
    },
  },
});

appDb.users.createIndex({ email: 1 }, { unique: true });
appDb.clients.createIndex({ userId: 1 }, { unique: true, sparse: true });
appDb.clients.createIndex({ document: 1 }, { unique: true, sparse: true });
appDb.machines.createIndex({ serialNumber: 1 }, { unique: true, sparse: true });
appDb.inventoryitems.createIndex({ sku: 1 }, { unique: true });
appDb.serviceorders.createIndex({ clientId: 1, createdAt: -1 });
appDb.serviceorders.createIndex({ machineId: 1, createdAt: -1 });
appDb.financialentries.createIndex({ date: -1, type: 1 });

print(`Database ${dbName} initialized successfully.`);