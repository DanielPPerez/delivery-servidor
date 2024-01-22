import { server } from './app.js';
import { connectDB } from './db.js';

connectDB();

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
