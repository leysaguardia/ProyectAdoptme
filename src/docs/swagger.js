import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'ProyectAdoptme API',
    version: '1.0.0',
    description: 'Documentación de la API (módulo Users + resto)',
  },
  servers: [
    { url: 'http://localhost:8080', description: 'Local' },
  ],
};

export const swaggerSpecs = swaggerJSDoc({
  swaggerDefinition,
  apis: [
    path.join(__dirname, '../routes/users.router.js'), 
  ],
});

export function mountSwagger(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
  console.log('📚 Swagger montado en /docs');
}
