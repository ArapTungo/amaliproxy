const http = require('http');
const https = require('https');
const url = require('url');

const config = require('./config');
const logger = require('./logger');

http.createServer((req, res) => {

    if (req.method !== 'POST') {
        res.writeHead(405);
        return res.end('POST only');
    }

    // 🔒 API KEY CHECK
    if (req.headers['x-api-key'] !== config.apiKey) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    let body = '';

    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {

        try {
            let targetUrl = req.headers['x-target-url'];

            if (!targetUrl) {
                res.writeHead(400);
                return res.end('Missing X-Target-Url');
            }

            // 🔒 Optional restriction
            if (config.allowedTarget && targetUrl !== config.allowedTarget) {
                res.writeHead(403);
                return res.end('Target not allowed');
            }

            const parsed = url.parse(targetUrl);

            logger.log("Forwarding request to: " + targetUrl);

            const options = {
                hostname: parsed.hostname,
                path: parsed.path,
                method: 'POST',
                headers: {
                    'Content-Type': req.headers['content-type'] || 'application/soap+xml',
                    'SOAPAction': req.headers['soapaction'] || '',
                    'Content-Length': Buffer.byteLength(body)
                }
            };

            const proxyReq = https.request(options, (proxyRes) => {

                let responseData = '';

                proxyRes.on('data', chunk => {
                    responseData += chunk;
                });

                proxyRes.on('end', () => {
                    logger.log("Response OK");

                    res.writeHead(200, { 'Content-Type': 'text/xml' });
                    res.end(responseData);
                });
            });

            proxyReq.on('error', (err) => {
                logger.error(err.toString());

                res.writeHead(500);
                res.end(err.toString());
            });

            proxyReq.write(body);
            proxyReq.end();

        } catch (ex) {
            logger.error(ex.toString());

            res.writeHead(500);
            res.end(ex.toString());
        }
    });

}).listen(config.port, () => {
    logger.log("Proxy running on port " + config.port);
});