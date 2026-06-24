const Recipe = require('../models/Recipe');

class RecipeController {
  static async getAllRecipes(req, res) {
    try {
      const { categoryId, difficulty, userId } = req.query;
      const filters = {
        status: 'publicada' // Solo mostrar recetas publicadas
      };
      if (categoryId) filters.categoryId = parseInt(categoryId, 10);
      if (difficulty) filters.difficulty = difficulty;
      if (userId) filters.userId = parseInt(userId, 10);

      const recipes = await Recipe.findAll(filters);

      return res.json({
        success: true,
        count: recipes.length,
        data: recipes
      });
    } catch (error) {
      console.error('Error in getAllRecipes:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching recipes', 
        error: error.message 
      });
    }
  }

  static async getRecipeById(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid recipe ID' 
        });
      }

      const recipe = await Recipe.findById(id);
      if (!recipe) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recipe not found' 
        });
      }

      // Verificar que solo usuarios autenticados o admins puedan ver recetas no publicadas
      const isAuthenticated = req.user;
      const isAdmin = req.userRoles && req.userRoles.some(role => role.name === 'admin');
      const isOwner = isAuthenticated && recipe.userId === req.user.id;

      if (recipe.status !== 'publicada' && !isAdmin && !isOwner) {
        // Si la receta no está publicada y el usuario no es propietario ni admin, retornar 404
        return res.status(404).json({ 
          success: false, 
          message: 'Recipe not found' 
        });
      }

      let ingredients = [];
      let instructions = [];
      try {
        ingredients = await recipe.getIngredients();
        instructions = await recipe.getInstructions();
      } catch (err) {
        console.error('Error fetching ingredients/instructions:', err);
      }

      return res.json({
        success: true,
        data: {
          ...recipe,
          ingredients,
          instructions
        }
      });
    } catch (error) {
      console.error('Error in getRecipeById:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching recipe', 
        error: error.message 
      });
    }
  }

  static async incrementViews(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid recipe ID' 
        });
      }

      const recipe = await Recipe.findById(id);
      if (!recipe) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recipe not found' 
        });
      }

      const newViewsCount = await Recipe.incrementViews(id);

      return res.json({
        success: true,
        message: 'View count incremented successfully',
        data: {
          recipeId: id,
          newViewsCount
        }
      });
    } catch (error) {
      console.error('Error in incrementViews:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error incrementing views', 
        error: error.message 
      });
    }
  }

  static async searchRecipes(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }

      const recipes = await Recipe.search(q);
      return res.json({
        success: true,
        count: recipes.length,
        data: recipes
      });
    } catch (error) {
      console.error('Error in searchRecipes:', error);
      return res.status(500).json({
        success: false,
        message: 'Error searching recipes',
        error: error.message
      });
    }
  }

  static async createRecipe(req, res) {
    try {
      const recipeData = req.body;
      if (!recipeData || Object.keys(recipeData).length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Recipe data required' 
        });
      }

      // Obtener userId del usuario autenticado (del middleware basicAuth)
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      // Usar SOLO el userId del middleware, ignorar el del frontend
      recipeData.userId = userId;
      // Si no se proporciona status, establecer default a 'pendiente'
      recipeData.status = recipeData.status || 'pendiente';

      const newRecipe = await Recipe.create(recipeData);
      return res.status(201).json({ 
        success: true, 
        message: 'Recipe created successfully', 
        data: newRecipe 
      });
    } catch (error) {
      console.error('Error in createRecipe:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error creating recipe', 
        error: error.message 
      });
    }
  }

  static async updateRecipe(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid recipe ID' 
        });
      }

      const updateData = req.body;
      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Update data required' 
        });
      }

      const recipe = await Recipe.findById(id);
      if (!recipe) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recipe not found' 
        });
      }

      const userId = req.user?.id;
      if (recipe.userId !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to update this recipe' 
        });
      }

      const updated = await Recipe.update(id, updateData);
      if (!updated) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recipe not found' 
        });
      }

      return res.json({ 
        success: true, 
        message: 'Recipe updated successfully', 
        data: updated 
      });
    } catch (error) {
      console.error('Error in updateRecipe:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error updating recipe', 
        error: error.message 
      });
    }
  }

  static async deleteRecipe(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid recipe ID' 
        });
      }

      const recipe = await Recipe.findById(id);
      if (!recipe) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recipe not found' 
        });
      }

      const userId = req.user?.id;
      if (recipe.userId !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to delete this recipe' 
        });
      }

      await Recipe.delete(id);
      return res.json({ 
        success: true, 
        message: 'Recipe deleted successfully' 
      });
    } catch (error) {
      console.error('Error in deleteRecipe:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error deleting recipe', 
        error: error.message 
      });
    }
  }

  static async getUserPendingRecipes(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }

      const recipes = await Recipe.findAll({
        userId: userId,
        status: 'pendiente'
      });

      return res.json({
        success: true,
        count: recipes.length,
        data: recipes
      });
    } catch (error) {
      console.error('Error in getUserPendingRecipes:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching pending recipes', 
        error: error.message 
      });
    }
  }

  static async getUserRejectedRecipes(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }

      const recipes = await Recipe.findAll({
        userId: userId,
        status: 'rechazada'
      });

      return res.json({
        success: true,
        count: recipes.length,
        data: recipes
      });
    } catch (error) {
      console.error('Error in getUserRejectedRecipes:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching rejected recipes', 
        error: error.message 
      });
    }
  }
}

module.exports = RecipeController;