const Favorite = require('../models/Favorite');

class FavoriteController {
  static async addFavorite(req, res) {
    try {
      const { recipeId } = req.body;
      const userId = req.user.id;

      if (!recipeId) {
        return res.status(400).json({
          success: false,
          message: 'recipeId is required'
        });
      }

      const favorite = await Favorite.create(userId, recipeId);
      res.status(201).json({
        success: true,
        data: favorite,
        message: 'Recipe added to favorites'
      });
    } catch (err) {
      console.error('Error adding favorite:', err);
      res.status(err.message === 'Recipe not found' ? 404 : 500).json({
        success: false,
        message: err.message || 'Error adding favorite'
      });
    }
  }

  static async removeFavorite(req, res) {
    try {
      const { recipeId } = req.params;
      const userId = req.user.id;

      if (!recipeId) {
        return res.status(400).json({
          success: false,
          message: 'recipeId is required'
        });
      }

      const recipeIdNum = parseInt(recipeId, 10);
      if (isNaN(recipeIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid recipeId'
        });
      }

      const deleted = await Favorite.delete(userId, recipeIdNum);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Favorite not found'
        });
      }

      res.json({
        success: true,
        message: 'Recipe removed from favorites'
      });
    } catch (err) {
      console.error('Error removing favorite:', err);
      res.status(500).json({
        success: false,
        message: 'Error removing favorite'
      });
    }
  }

  static async getUserFavorites(req, res) {
    try {
      const { userId } = req.params;

      const userIdNum = parseInt(userId, 10);
      if (isNaN(userIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid userId'
        });
      }

      const favorites = await Favorite.findByUser(userIdNum, true);
      res.json({
        success: true,
        data: favorites,
        count: favorites.length
      });
    } catch (err) {
      console.error('Error fetching favorites:', err);
      res.status(500).json({
        success: false,
        message: 'Error fetching favorites'
      });
    }
  }

  static async isFavorite(req, res) {
    try {
      const { recipeId } = req.params;
      const userId = req.user.id;

      const recipeIdNum = parseInt(recipeId, 10);
      if (isNaN(recipeIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid recipeId'
        });
      }

      const isFav = await Favorite.isFavorite(userId, recipeIdNum);
      res.json({
        success: true,
        data: { isFavorite: isFav }
      });
    } catch (err) {
      console.error('Error checking favorite:', err);
      res.status(500).json({
        success: false,
        message: 'Error checking favorite'
      });
    }
  }
}

module.exports = FavoriteController;
