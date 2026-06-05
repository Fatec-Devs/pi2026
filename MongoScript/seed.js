// Run this file with mongosh connected to your MongoDB Atlas cluster.
// Example:
// mongosh "mongodb+srv://<user>:<password>@<cluster>/pi-app-2026" --file MongoScript/seed.js

const appDb = db.getSiblingDB('pi-app-2026');
const users = appDb.getCollection('users');

const seedUsers = [
  {
    name: 'Admin',
    email: 'admin@pi-app-2026.com',
    passwordHash: '$2b$12$PFvE0ApwZKsSPl3R.Rqe4uE.S3vPazpltKawHV8kw1eFyYkvZuu32',
    role: 'ADMIN',
    phone: '',
    active: true,
  },
  {
    name: 'Usuario Comum',
    email: 'user@pi-app-2026.com',
    passwordHash: '$2b$12$PUdNQWQDq7UDiC/.ENUKL.QaN0WT2HxD0//NVnx9Es08z0z6zJ8Ym',
    role: 'CLIENT',
    phone: '',
    active: true,
  },
];

for (const user of seedUsers) {
  users.updateOne(
    { email: user.email },
    { $setOnInsert: user },
    { upsert: true },
  );
}

const clients = appDb.getCollection('clients');
const inventory = appDb.getCollection('inventoryitems');

const clientUser = users.findOne({ email: 'user@pi-app-2026.com' });

if (clientUser) {
  clients.updateOne(
    { userId: clientUser._id },
    {
      $setOnInsert: {
        userId: clientUser._id,
        document: '123.456.789-00',
        address: 'Rua Exemplo, 100 - São Paulo/SP',
        notes: 'Cliente de demonstração',
      },
    },
    { upsert: true },
  );
}

const seedInventory = [
  {
    name: 'Óleo de motor 5W30',
    sku: 'OLEO-5W30-1L',
    unit: 'LT',
    quantity: 24,
    minStock: 10,
    unitCost: 32.5,
    active: true,
  },
  {
    name: 'Filtro de óleo',
    sku: 'FILTRO-OLEO-01',
    unit: 'UNIDADE',
    quantity: 8,
    minStock: 15,
    unitCost: 18.9,
    active: true,
  },
  {
    name: 'Pastilha de freio dianteira',
    sku: 'PAST-FREIO-D',
    unit: 'PAR',
    quantity: 5,
    minStock: 4,
    unitCost: 89.0,
    active: true,
  },
];

for (const item of seedInventory) {
  inventory.updateOne({ sku: item.sku }, { $setOnInsert: item }, { upsert: true });
}

print('Seed completed: users, 1 client and sample inventory items.');