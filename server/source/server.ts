import express, {Express} from 'express'
import morgan from 'morgan'
import * as dotenv from 'dotenv' 
import cors from 'cors';
import path from 'path'
import { ErrorMiddleware } from './middleware/error.middleware';
import { AppRoutes } from './routes/routes';

const rootDir = __dirname;
const app: Express = express()

// Acceder a la configuracion del archivo .env
dotenv.config();
// Puerto que escucha por defecto 300 o definido .env
const port = process.env.PORT || 3000;
// Middleware CORS para aceptar llamadas en el servidor
app.use(cors());
// Middleware para loggear las llamadas al servidor
app.use(morgan('dev'));

// Middleware para gestionar Requests y Response json
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Middleware de log para todas las peticiones
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

//---- Registro de rutas ----
console.log(' Registrando rutas de la aplicación...');
app.use(AppRoutes.routes);

// CORREGIDO: Configurar rutas estáticas consistentes
const uploadsDir = path.join(path.resolve(), "assets/uploads");

// Servir archivos estáticos en /images (para el frontend)
app.use("/images", express.static(uploadsDir));

// También servir en /files para compatibilidad (opcional)
app.use("/files", express.static(uploadsDir));

console.log(' Middlewares estáticos configurados en /images y /files');
console.log('Directorio de uploads:', uploadsDir);

//Gestión de errores middleware
app.use(ErrorMiddleware.handleError);

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
  console.log('Presione CTRL-C para deternerlo\n');
});