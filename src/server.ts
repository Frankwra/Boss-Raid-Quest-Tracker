import Fastify from 'fastify';
import { questsRoutes } from './routes/quests.routes.js';

const app = Fastify({
  logger: true,
});

app.register(questsRoutes);

const PORT = 3333;
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
