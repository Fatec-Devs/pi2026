const dbName = 'pi-app-2026';
const appDb = db.getSiblingDB(dbName);

function ensureCollection(name, options = {}) {
  if (!appDb.getCollectionNames().includes(name)) {
    appDb.createCollection(name, options);
  }
}

// Máquinas
db.machines.insertMany([
  {
    name: "Torno CNC Alpha",
    brand: "Romi",
    model: "Centur 30D",
    serialNumber: "ROMI-2025-001",
    location: "Setor Produção A",
    notes: "Máquina de usinagem principal, revisar alinhamento semanalmente.",
    status: "ATIVO",
    active: true
  },
  {
    name: "Fresadora Industrial Beta",
    brand: "Haas",
    model: "VF-2",
    serialNumber: "HAAS-2025-002",
    location: "Setor Produção B",
    notes: "Usada para peças de precisão. Verificar lubrificação antes do uso.",
    status: "EM_MANUTENCAO",
    active: true
  }
]);