# SaborCraft

SaborCraft es una plataforma web de recetas pensada para compartir, descubrir y valorar contenido culinario de forma sencilla. El proyecto combina un frontend en Vue 3 con una API en Node.js y MySQL, y está orientado a mostrar una solución full stack completa para portfolio.

## Resumen

- Plataforma de recetas con registro, autenticación y perfiles de usuario.
- Creación, edición, valoración y marcado como favorito de recetas.
- Panel de administración para moderación y gestión de contenido.
- Interfaz responsive adaptada a escritorio y móvil.


## Stack tecnológico

Frontend:
- Vue 3
- Vue Router
- Vite
- Tailwind CSS
- Axios

Backend:
- Node.js
- Express
- MySQL
- mysql2
- cors
- dotenv

## Estructura del proyecto

```text
saborcraft/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── router/
│   │   ├── services/
│   │   └── views/
│   └── vite.config.js
└── docs/
	├── ANEXO-4_saborcraft_estructura.sql
	└── ANEXO-4_saborcraft_datos.sql
```

## Requisitos previos

- Node.js 16 o superior
- npm
- MySQL 5.7 o superior
- Git, opcional

## Instalación rápida

### 1. Clona el repositorio

```bash
git clone <url-del-repositorio>
cd saborcraft
```

### 2. Crea la base de datos e importa los datos

```sql
CREATE DATABASE saborcraft CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

Después importa los ficheros SQL de la carpeta `docs`:

```bash
cd docs
mysql -u root -p saborcraft < ANEXO-4_saborcraft_estructura.sql
mysql -u root -p saborcraft < ANEXO-4_saborcraft_datos.sql
```

### 3. Configura el backend

```bash
cd backend
npm install
```

Crea un archivo `.env` dentro de `backend` con este contenido:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=saborcraft

PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 4. Configura el frontend

```bash
cd frontend
npm install
```

## Cómo ejecutar el proyecto

Abre dos terminales.

Terminal 1, backend:

```bash
cd backend
npm start
```

Terminal 2, frontend:

```bash
cd frontend
npm run dev
```

Una vez levantado, accede a:

- Frontend: http://localhost:5173
- API: http://localhost:3000

## Scripts disponibles

Backend:

- `npm start`: arranca el servidor
- `npm run dev`: arranca con nodemon
- `npm test`: comprueba la conexión con la base de datos

Frontend:

- `npm run dev`: inicia Vite en modo desarrollo
- `npm run build`: genera la versión de producción
- `npm run preview`: previsualiza la build localmente

## Funcionalidades destacadas

- Registro e inicio de sesión
- Gestión de recetas
- Valoraciones con estrellas
- Favoritos
- Buscador y filtros
- Perfil de usuario
- Panel de administración
- Validaciones y protección de rutas

## Rutas principales

- `/` inicio
- `/recipes` listado de recetas
- `/recipes/:id` detalle de receta
- `/recipes/create` crear receta
- `/recipes/:id/edit` editar receta
- `/login` acceso
- `/register` registro
- `/profile` perfil
- `/profile/edit` edición de perfil
- `/admin` panel de administración

## Aprendizajes y valor de portfolio

Este proyecto me permitió trabajar con una arquitectura completa de frontend y backend, integrar autenticación, diseñar una base de datos relacional, gestionar formularios complejos y construir una experiencia responsive. Es una buena pieza para portfolio porque muestra trabajo real sobre una aplicación funcional de principio a fin.

## Autor

José Antonio Benítez Ruiz

## Licencia

Proyecto educativo del Ciclo Superior de Desarrollo de Aplicaciones Web (DAW).
