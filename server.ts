import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './server/app';

const PORT = 3000;

async function startServer() {
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

  // ==========================================
  // VITE MIDDLEWARE (DEV) & STATIC (PROD)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVIDOR ATIVO] Plataforma com 28 Cursos EAD DETRAN rodando na porta ${PORT}`);
    console.log(`[WEBHOOK URL]: ${appUrl}/api/webhooks/mercadopago`);
  });
}

startServer();
