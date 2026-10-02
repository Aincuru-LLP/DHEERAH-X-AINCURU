import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

const devEnv = loadEnv('development', process.cwd(), '');

const sentryPlugin =
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
    ? sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
      })
    : null;

const apiDevPlugin = {
  name: 'api-dev-middleware',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url === '/api/csrf' || req.url?.startsWith('/api/csrf?')) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Set-Cookie', 'tresor_csrf=dev-csrf-token; Path=/; SameSite=Lax');
        res.end(JSON.stringify({ token: 'dev-csrf-token' }));
        return;
      }
      if (req.url === '/api/orders/place' || req.url?.startsWith('/api/orders/place?')) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ devMode: true, message: 'Local dev server: using direct Firestore order placement' }));
        return;
      }
      if (req.url === '/api/payments/create-order' || req.url?.startsWith('/api/payments/create-order?')) {
        let bodyStr = '';
        req.on('data', (chunk: any) => {
          bodyStr += chunk;
        });
        req.on('end', async () => {
          try {
            const body = JSON.parse(bodyStr || '{}');
            const key_id = devEnv.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
            const key_secret = devEnv.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

            if (!key_id || !key_secret) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'payments_not_configured' }));
              return;
            }

            const amountMinor = Number(body.amountMinor) || 10000;
            const RazorpayModule = await import('razorpay');
            const Razorpay = (RazorpayModule as any).default || RazorpayModule;
            const rzp = new Razorpay({ key_id, key_secret });
            const order = await rzp.orders.create({
              amount: amountMinor,
              currency: 'INR',
              receipt: `tc_${Date.now().toString(36)}`,
              notes: {
                itemCount: String(body.items?.length || 0),
                paymentMethod: body.paymentMethod || 'upi',
              },
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                orderId: order.id,
                amount: order.amount,
                currency: 'INR',
                razorpayKeyId: key_id,
                breakdown: {
                  total: Math.round(order.amount / 100),
                },
              }),
            );
          } catch (err: any) {
            console.error('[dev-create-order-error]', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'create_order_failed' }));
          }
        });
        return;
      }
      if (req.url === '/api/payments/verify' || req.url?.startsWith('/api/payments/verify?')) {
        let bodyStr = '';
        req.on('data', (chunk: any) => {
          bodyStr += chunk;
        });
        req.on('end', async () => {
          try {
            const body = JSON.parse(bodyStr || '{}');
            const key_secret = devEnv.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
            if (!key_secret) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'payments_not_configured' }));
              return;
            }

            const crypto = await import('node:crypto');
            const expected = crypto
              .createHmac('sha256', key_secret)
              .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
              .digest('hex');

            if (expected !== body.razorpay_signature) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'signature_mismatch' }));
              return;
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                ok: true,
                devMode: true,
                orderId: `tc_dev_${Date.now().toString(36)}`,
              }),
            );
          } catch (err: any) {
            console.error('[dev-verify-error]', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'verify_failed' }));
          }
        });
        return;
      }
      next();
    });
  },
};


export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevPlugin, ...(sentryPlugin ? [sentryPlugin] : [])],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify — file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    target: 'es2020',
    sourcemap: Boolean(sentryPlugin),
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Pin large vendor libs into their own long-cached chunks so app
        // updates don't bust the runtime cache for unchanged dependencies.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'vendor-react';
          if (id.includes('/motion/') || id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('/lucide-react/')) return 'vendor-icons';
          if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'vendor-firebase';
          return 'vendor';
        },
      },
    },
  },
});
