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

print('Basic seed completed: 1 admin and 1 common user.');