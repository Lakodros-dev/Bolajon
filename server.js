/**
 * Custom Next.js Server with Socket.IO
 */
import { createServer } from 'node:http';
import { parse } from 'node:url';
import next from 'next';
import { initSocketServer } from './lib/socket.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3007', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error:', err);
            res.statusCode = 500;
            res.end('Internal server error');
        }
    });

    initSocketServer(httpServer);

    httpServer
        .once('error', (err) => {
            console.error('Server error:', err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`✅ Ready on http://${hostname}:${port}`);
        });
}).catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
});
