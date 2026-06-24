# SaborCraft - Plataforma de Recetas Colaborativa

Bienvenido a **SaborCraft**, una plataforma web moderna donde usuarios pueden compartir, descubrir y valorar recetas culinarias de forma sencilla y comunitaria.

## Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- **Node.js** (v16 o superior) - [Descargar](https://nodejs.org/)
- **npm** (viene con Node.js)
- **MySQL** (v5.7 o superior) - [Descargar](https://www.mysql.com/downloads/)
- **Git** (opcional pero recomendado)

## Inicio Rápido

### Paso 1: Clonar o descargar el proyecto

```bash
# Si tienes Git
git clone <url-del-repositorio>
cd saborcraft

# O simplemente descomprime la carpeta del proyecto
```

### Paso 2: Configurar la Base de Datos

1. **Abre MySQL** (MySQL Workbench o línea de comandos)

2. **Crea la base de datos:**

```sql
CREATE DATABASE saborcraft CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

3. **Importa la estructura y datos:**

```bash
# En la terminal/CMD, ve a la carpeta del proyecto
cd saborcraft/docs

# Ejecuta primero la estructura
mysql -u root -p saborcraft < ANEXO-4_saborcraft_estructura.sql

# Luego los datos
mysql -u root -p saborcraft < ANEXO-4_saborcraft_datos.sql
```

> Nota: Si no tienes contraseña MySQL, quita `-p`

### Paso 3: Configurar el Backend

```bash
# Entra en la carpeta del backend
cd saborcraft/backend

# Instala las dependencias
npm install

# Crea el archivo .env con tus configuraciones
# (Copia el contenido de abajo en un archivo llamado .env)
```

**Contenido del archivo `.env` (backend):**

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_DATABASE=saborcraft
DB_PORT=3306

PORT=3000
NODE_ENV=development
```


### Paso 4: Configurar el Frontend

```bash
# Abre otra terminal y entra en la carpeta del frontend
cd saborcraft/frontend

# Instala las dependencias
npm install
```

## Ejecutar el Proyecto

### Terminal 1 - Backend

```bash
cd saborcraft/backend
npm start
```

Deberías ver:
```
✓ Servidor escuchando en puerto 3000
✓ Conexión a base de datos establecida
```

### Terminal 2 - Frontend

```bash
cd saborcraft/frontend
npm run dev
```

Deberías ver algo como:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Listo

Abre tu navegador y ve a:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000/api`

## Credenciales de Prueba

Puedes usar estas cuentas para probar:

| Usuario | Email | Contraseña | Tipo |
|---------|-------|-----------|------|
| admin | admin@example.com | admin | Administrador |
| baraja24 | user1@example.com | 1234 | Usuario Normal |


## Funcionalidades Principales

- **Autenticación** - Login/Registro con JWT
- **CRUD de Recetas** - Crear, leer, editar, borrar
- **Sistema de Valoraciones** - Rating con estrellas (1-5)
- **Favoritos** - Marcar recetas como favoritas
- **Búsqueda y Filtros** - Por categoría, ingredientes, etc
- **Perfil de Usuario** - Ver y editar información
- **Panel de Admin** - Gestionar recetas, categorías, usuarios
- **Responsive Design** - Funciona en desktop, tablet y móvil  

## Tecnologías Utilizadas

**Backend:**
- Node.js + Express.js
- MySQL
- JWT para autenticación
- bcrypt para encriptación de contraseñas

**Frontend:**
- Vue.js 3 (Composition API)
- Vite (bundler)
- Tailwind CSS (estilos)
- Axios (peticiones HTTP)
- Vue Router (navegación)

### Modo Debug
En la consola del navegador (F12) puedes ver las peticiones API en la pestaña Network.


## Licencia

Proyecto educativo - Ciclo Superior de Desarrollo de Aplicaciones Web (DAW)

Autor: **José Antonio Benítez Ruiz**

---

Disfruta usando SaborCraft.
