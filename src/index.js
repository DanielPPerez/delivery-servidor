// index.js
import { app, server } from './app.js';
import { connectDB } from './db.js';
import { PORT } from './config.js';

connectDB();

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
