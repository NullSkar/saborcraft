const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/RatingController');
const basicAuth = require('../middleware/basicAuth');

/**
 * @route   POST /api/ratings
 * @desc    Crear un nuevo rating (requiere autenticación)
 * @access  Private
 */
router.post('/', basicAuth, RatingController.create);

/**
 * @route   PUT /api/ratings/:id
 * @desc    Actualizar un rating (requiere autenticación)
 * @access  Private
 */
router.put('/:id', basicAuth, RatingController.update);

/**
 * @route   DELETE /api/ratings/:id
 * @desc    Eliminar un rating (requiere autenticación)
 * @access  Private
 */
router.delete('/:id', basicAuth, RatingController.delete);

/**
 * @route   GET /api/ratings/recipe/:recipeId
 * @desc    Obtener todos los ratings de una receta
 * @access  Public
 */
router.get('/recipe/:recipeId', RatingController.getByRecipe);

module.exports = router;
