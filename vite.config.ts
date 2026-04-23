import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import type { Plugin } from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'roblox-group-check-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url) return next();
            const url = new URL(req.url, 'http://localhost');
            if (url.pathname !== '/api/roblox-group-check') return next();

            if ((req.method ?? 'GET').toUpperCase() === 'OPTIONS') {
              res.statusCode = 200;
              res.end();
              return;
            }

            if ((req.method ?? 'GET').toUpperCase() !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ ok: false, error: 'method not allowed' }));
              return;
            }

            const readBody = () =>
              new Promise<string>((resolve) => {
                let body = '';
                req.on('data', (chunk) => (body += chunk));
                req.on('end', () => resolve(body));
              });

            const bodyText = await readBody();
            let username = '';
            try {
              const parsed = JSON.parse(bodyText) as { username?: unknown };
              if (typeof parsed.username === 'string') username = parsed.username;
            } catch {}

            username = username.trim();
            if (!username) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ ok: false, error: 'username is required' }));
              return;
            }

            const apiKey =
              env.X_API_KEY ||
              process.env.X_API_KEY ||
              env.VITE_X_API_KEY ||
              process.env.VITE_X_API_KEY;

            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ ok: false, error: 'missing server api key' }));
              return;
            }

            try {
              const usernameRes = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  usernames: [username],
                  excludeBannedUsers: true
                })
              });

              const usernameData = (await usernameRes.json()) as any;
              const userId = usernameData?.data?.[0]?.id;

              if (!userId) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(
                  JSON.stringify({
                    ok: true,
                    status: 'invalid',
                    userId: null,
                    days: null,
                    message: 'Username Roblox tidak ditemukan atau user dibanned.'
                  })
                );
                return;
              }

              const groupId = '704572305';
              const filter = encodeURIComponent(`user=='users/${userId}'`);
              const membershipRes = await fetch(
                `https://apis.roblox.com/cloud/v2/groups/${groupId}/memberships?filter=${filter}`,
                { headers: { 'x-api-key': apiKey, 'accept': 'application/json' } }
              );

              const membershipData = (await membershipRes.json()) as any;
              const memberships = membershipData?.groupMemberships;
              const hasMembership = Array.isArray(memberships) && memberships.length > 0;
              const createTime = hasMembership ? (memberships?.[0]?.createTime as string | undefined) : undefined;

              if (!hasMembership) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(
                  JSON.stringify({
                    ok: true,
                    status: 'invalid',
                    userId,
                    days: 0,
                    message: 'Kamu belum join group.'
                  })
                );
                return;
              }

              if (!createTime) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(
                  JSON.stringify({
                    ok: true,
                    status: 'invalid',
                    userId,
                    days: null,
                    message: 'Kamu sudah join group, tapi tanggal join tidak terbaca. Coba cek lagi nanti.'
                  })
                );
                return;
              }

              const joinedAtMs = new Date(createTime).getTime();
              const nowMs = Date.now();
              const days = Math.floor((nowMs - joinedAtMs) / (1000 * 60 * 60 * 24));
              const safeDays = Number.isFinite(days) ? Math.max(0, days) : null;
              const eligible = typeof safeDays === 'number' && safeDays >= 6;

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(
                JSON.stringify({
                  ok: true,
                  status: eligible ? 'valid' : 'invalid',
                  userId,
                  days: safeDays,
                  message: eligible ? 'Sudah join group ≥ 6 hari.' : `Kamu sudah join group, tapi belum 6 hari (baru ${safeDays ?? 0} hari).`
                })
              );
            } catch {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ ok: false, error: 'failed to check membership' }));
            }
          });
        }
      } satisfies Plugin
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
