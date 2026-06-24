const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');

/**
 * @route   GET /api/ingredients
 * @desc    Obtener todos los ingredientes
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll();
    return res.json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching ingredients',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ingredients/:id
 * @desc    Obtener ingrediente por ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ingredient ID'
      });
    }

    const ingredient = await Ingredient.findById(id);
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    return res.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching ingredient',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ingredients/search?term=
 * @desc    Buscar ingredientes por término
 * @access  Public
 */
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    if (!term || term.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const ingredients = await Ingredient.search(term);
    return res.json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });
  } catch (error) {
    console.error('Error searching ingredients:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching ingredients',
      error: error.message
    });
  }
});

module.exports = router;
