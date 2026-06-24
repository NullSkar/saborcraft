const express = require('express');
const router = express.Router();
const RecipeController = require('../controllers/recipeController');
const basicAuth = require('../middleware/basicAuth');

/**
 * Middleware para autenticación opcional
 */
const optionalBasicAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      // No hay autenticación, continuar sin usuario
      return next();
    }
    // Si hay autenticación, procesarla
    await basicAuth(req, res, next);
  } catch (err) {
    // Si falla la autenticación, continuar sin usuario
    next();
  }
};

/**
 * @route   POST /api/recipes
 * @desc    Crear una nueva receta
 * @access  Private (requiere autenticación)
 */
router.post('/', basicAuth, RecipeController.createRecipe);

/**
 * @route   PUT /api/recipes/:id
 * @desc    Actualizar una receta
 * @access  Private (requiere autenticación)
 */
router.put('/:id', basicAuth, RecipeController.updateRecipe);

/**
 * @route   DELETE /api/recipes/:id
 * @desc    Eliminar una receta
 * @access  Private (requiere autenticación)
 */
router.delete('/:id', basicAuth, RecipeController.deleteRecipe);

/**
 * @route   GET /api/recipes/pending
 * @desc    Obtener recetas pendientes del usuario autenticado
 * @access  Private (requiere autenticación)
 */
router.get('/pending', basicAuth, RecipeController.getUserPendingRecipes);

/**
 * @route   GET /api/recipes/rejected
 * @desc    Obtener recetas rechazadas del usuario autenticado
 * @access  Private (requiere autenticación)
 */
router.get('/rejected', basicAuth, RecipeController.getUserRejectedRecipes);

/**
 * @route   GET /api/recipes/search
 * @desc    Buscar recetas por término
 * @access  Public
 */
router.get('/search', RecipeController.searchRecipes);

/**
 * @route   POST /api/recipes/:id/views
 * @desc    Incrementar contador de vistas
 * @access  Public
 */
router.post('/:id/views', RecipeController.incrementViews);

/**
 * @route   GET /api/recipes/:id
 * @desc    Obtener una receta por ID
 * @access  Public (pero se puede autenticar para ver recetas no publicadas)
 */
router.get('/:id', optionalBasicAuth, RecipeController.getRecipeById);

/**
 * @route   GET /api/recipes
 * @desc    Obtener todas las recetas
 * @access  Public
 */
router.get('/', RecipeController.getAllRecipes);

module.exports = router;