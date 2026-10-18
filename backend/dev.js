// Boots an in-memory MongoDB (no local MongoDB install needed), then starts
// the API server against it. Data lives in RAM and resets on restart.
// Usage: npm run dev:memory
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.PORT = process.env.PORT || '5000';
  // eslint-disable-next-line no-console
  console.log(`In-memory MongoDB ready at ${mongod.getUri()}`);
  require('./server');
})().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start in-memory MongoDB:', err);
  process.exit(1);
});
