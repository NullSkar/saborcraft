const Category = require('../models/Category');

class CategoryController {

  static async getAll(req, res) {
    try {
      const categories = await Category.findAll();
      return res.json({
        success: true,
        count: categories.length,
        data: categories
      });
    } catch (error) {
      console.error('Error in getAll:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      return res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Error in getById:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching category',
        error: error.message
      });
    }
  }

  static async getRecipes(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const recipes = await category.getRecipes();
      return res.json({
        success: true,
        count: recipes.length,
        data: recipes
      });
    } catch (error) {
      console.error('Error in getRecipes:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching recipes',
        error: error.message
      });
    }
  }
}

module.exports = CategoryController;
