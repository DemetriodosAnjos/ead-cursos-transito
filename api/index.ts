import app from '../server/app';

// Handler serverless compatível com a plataforma Vercel
export default function handler(req: any, res: any) {
  return app(req, res);
}
