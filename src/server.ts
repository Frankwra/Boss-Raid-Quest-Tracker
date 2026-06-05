import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { questsRoutes } from './routes/quests.routes.js';
import { env } from './config/env.js';
import { buildCorsOptions } from './config/cors.js';

const app = Fastify({
  logger: true,
});

await app.register(cors, buildCorsOptions(env.FRONTEND_URL));

app.register(questsRoutes);

const PORT = Number(env.PORT);
const HOST = '0.0.0.0';

app
  .listen({ port: PORT, host: HOST })
  .then(() => {
    app.log.info(`Servidor rodando em http://${HOST}:${PORT}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
