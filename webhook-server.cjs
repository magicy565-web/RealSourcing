#!/usr/bin/env node

/**
 * GitHub Webhook Server for Auto-Deployment
 * Listens for push events to main branch and triggers deployment
 */

const http = require('http');
const { execSync } = require('child_process');
const crypto = require('crypto');

const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'realsourcing-webhook-secret';
const DEPLOY_SCRIPT = '/var/www/realsourcing/deploy.sh';

// Verify GitHub webhook signature
function verifySignature(payload, signature) {
  if (!signature) return false;
  
  const hmac = crypto.createHmac('sha256', SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Execute deployment script
function deploy() {
  console.log('[Webhook] Starting deployment...');
  
  try {
    const output = execSync(`bash ${DEPLOY_SCRIPT}`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    console.log('[Webhook] Deployment output:');
    console.log(output);
    console.log('[Webhook] Deployment completed successfully');
    
    return { success: true, output };
  } catch (error) {
    console.error('[Webhook] Deployment failed:', error.message);
    console.error('[Webhook] Error output:', error.stdout || error.stderr);
    
    return { success: false, error: error.message };
  }
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Only accept POST requests to /webhook
  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    const signature = req.headers['x-hub-signature-256'];
    
    console.log('[Webhook] Received request');
    console.log('[Webhook] Signature header:', signature);
    console.log('[Webhook] Body length:', body.length);
    console.log('[Webhook] SECRET:', SECRET);
    
    // Verify signature
    if (!verifySignature(body, signature)) {
      console.error('[Webhook] Invalid signature');
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Invalid signature' }));
      return;
    }
    
    try {
      const payload = JSON.parse(body);
      
      // Check if it's a push event to main branch
      if (payload.ref === 'refs/heads/main') {
        console.log('[Webhook] Received push event to main branch');
        console.log('[Webhook] Commit:', payload.head_commit?.message);
        console.log('[Webhook] Author:', payload.head_commit?.author?.name);
        
        // Trigger deployment asynchronously
        setTimeout(() => {
          deploy();
        }, 1000);
        
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Deployment triggered' }));
      } else {
        console.log('[Webhook] Ignoring push to branch:', payload.ref);
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Ignored' }));
      }
    } catch (error) {
      console.error('[Webhook] Error processing webhook:', error.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[Webhook] Server listening on port ${PORT}`);
  console.log(`[Webhook] Endpoint: http://localhost:${PORT}/webhook`);
  console.log(`[Webhook] Deploy script: ${DEPLOY_SCRIPT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Webhook] Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('[Webhook] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Webhook] Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('[Webhook] Server closed');
    process.exit(0);
  });
});
