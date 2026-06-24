const express = require('express');
const cors = require('cors');
require('dotenv').config();

const databaseService = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const recipeRoutes = require('./routes/recipes');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const ratingRoutes = require('./routes/ratings');
const ingredientRoutes = require('./routes/ingredients');
const favoriteRoutes = require('./routes/favorites');
const adminRoutes = require('./routes/admin');

// Inicializar Express
const app = express();

// ============================================
// MIDDLEWARES
// ============================================

// Body parser - Aumentar límite a 100MB para permitir imágenes base64
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// ============================================
// RUTAS
// ============================================

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'SaborCraft API',
        version: '1.0.0',
        endpoints: {
            recipes: '/api/recipes',
            recipeDetail: '/api/recipes/:id',
            search: '/api/recipes/search?q=term',
            incrementViews: '/api/recipes/:id/views'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Rutas de la API
app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes); 
// ============================================
// MANEJO DE ERRORES
// ============================================


app.use(notFound);


app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        console.log('Conectando a la base de datos...');
        await databaseService.testConnection();
        console.log('Conexión a la base de datos exitosa.');
        console.log('Iniciando el servidor...');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

process.on('SIGTERM', () => {
    console.log('SIGTERM recibido. Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT recibido. Cerrando servidor...');
    process.exit(0);
});

// Iniciar servidor
startServer();