const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');

/**
 * @route   GET /api/categories
 * @desc    Obtener todas las categorías
 * @access  Public
 */
router.get('/', CategoryController.getAll);

/**
 * @route   GET /api/categories/:id
 * @desc    Obtener una categoría por ID
 * @access  Public
 */
router.get('/:id', CategoryController.getById);

/**
 * @route   GET /api/categories/:id/recipes
 * @desc    Obtener recetas de una categoría
 * @access  Public
 */
router.get('/:id/recipes', CategoryController.getRecipes);

module.exports = router;
