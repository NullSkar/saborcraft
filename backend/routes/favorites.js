const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favoriteController');
const basicAuth = require('../middleware/basicAuth');

/**
 * @route   POST /api/favorites
 * @desc    Agregar receta a favoritos
 * @access  Private (requiere autenticación)
 */
router.post('/', basicAuth, FavoriteController.addFavorite);

/**
 * @route   DELETE /api/favorites/:recipeId
 * @desc    Eliminar receta de favoritos
 * @access  Private (requiere autenticación)
 */
router.delete('/:recipeId', basicAuth, FavoriteController.removeFavorite);

/**
 * @route   GET /api/favorites/user/:userId
 * @desc    Obtener favoritos de un usuario
 * @access  Public
 */
router.get('/user/:userId', FavoriteController.getUserFavorites);

/**
 * @route   GET /api/favorites/check/:recipeId
 * @desc    Verificar si una receta es favorita del usuario actual
 * @access  Private (requiere autenticación)
 */
router.get('/check/:recipeId', basicAuth, FavoriteController.isFavorite);

module.exports = router;
