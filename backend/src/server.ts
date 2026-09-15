import http from 'http';
import app from './app';
import { initSocket } from './socket';

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => console.log(`Finance Pro API em http://localhost:${PORT}`));
