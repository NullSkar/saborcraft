const db = require('../config/database');
const Recipe = require('../models/Recipe');
const { query } = require('../config/database');

class AdminController {
  // ========== ESTADÍSTICAS ==========
  static async getStats(req, res) {
    try {
      const stats = {};

      // Total de recetas
      const [recipes] = await db.query('SELECT COUNT(*) as count FROM recipes');
      stats.totalRecipes = recipes[0].count;

      // Recetas por estado
      const [recipesByStatus] = await db.query(`
        SELECT status, COUNT(*) as count FROM recipes GROUP BY status
      `);
      stats.recipesByStatus = recipesByStatus.reduce((acc, row) => {
        acc[row.status] = row.count;
        return acc;
      }, {});

      // Total de usuarios
      const [users] = await db.query('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
      stats.totalActiveUsers = users[0].count;

      // Total de calificaciones
      const [ratings] = await db.query('SELECT COUNT(*) as count FROM ratings');
      stats.totalRatings = ratings[0].count;

      // Promedio de rating global
      const [avgRating] = await db.query('SELECT AVG(rating) as avg FROM ratings');
      stats.averageRating = avgRating[0].avg ? parseFloat(avgRating[0].avg).toFixed(2) : 0;

      // Recetas vistas recientemente
      const [viewsCount] = await db.query('SELECT SUM(views_count) as total FROM recipes');
      stats.totalViews = viewsCount[0].total || 0;

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error en getStats:', error);
      res.status(500).json({ success: false, message: 'Error al obtener estadísticas', error: error.message });
    }
  }

  // ========== GESTIÓN DE RECETAS ==========
  static async getPendingRecipes(req, res) {
    try {
      const sql = `
        SELECT r.*, 
               u.id as author_id, u.username as author_username, u.email as author_email, u.avatar as author_avatar,
               c.id as category_id, c.name as category_name
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN categories c ON r.category_id = c.id
        WHERE r.status = 'pendiente'
        ORDER BY r.created_at DESC
      `;
      const [rows] = await db.query(sql);

      const recipes = (rows && rows.length > 0) ? rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        image: row.image ? (typeof row.image === 'string' ? row.image : row.image.toString('utf8')) : null,
        difficulty: row.difficulty,
        status: row.status,
        author: {
          id: row.author_id,
          username: row.author_username,
          email: row.author_email
        },
        category: {
          id: row.category_id,
          name: row.category_name
        },
        createdAt: row.created_at
      })) : [];

      res.json({ success: true, data: recipes, count: recipes.length });
    } catch (error) {
      console.error('Error en getPendingRecipes:', error);
      res.status(500).json({ success: false, message: 'Error al obtener recetas pendientes', error: error.message });
    }
  }

  static async getAllRecipes(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Obtener total de recetas
      const [countResult] = await db.query('SELECT COUNT(*) as total FROM recipes');
      const total = countResult[0].total;

      // Obtener recetas paginadas
      const sql = `
        SELECT r.*, 
               u.id as author_id, u.username as author_username, u.email as author_email, u.avatar as author_avatar,
               c.id as category_id, c.name as category_name, c.color as category_color
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN categories c ON r.category_id = c.id
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const [rows] = await db.query(sql, [limit, offset]);

      const recipes = (rows && rows.length > 0) ? rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        image: row.image ? (typeof row.image === 'string' ? row.image : row.image.toString('utf8')) : null,
        difficulty: row.difficulty,
        status: row.status,
        viewsCount: row.views_count,
        averageRating: row.average_rating,
        author: {
          id: row.author_id,
          username: row.author_username,
          email: row.author_email
        },
        category: {
          id: row.category_id,
          name: row.category_name,
          color: row.category_color || '#FF8B41'
        },
        createdAt: row.created_at
      })) : [];

      res.json({ 
        success: true, 
        data: recipes, 
        count: recipes.length,
        total: total,
        page: page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error en getAllRecipes:', error);
      res.status(500).json({ success: false, message: 'Error al obtener recetas', error: error.message });
    }
  }

  static async approveRecipe(req, res) {
    try {
      const { id } = req.params;
      const recipeId = parseInt(id, 10);
      
      if (isNaN(recipeId)) {
        return res.status(400).json({ success: false, message: 'ID de receta inválido' });
      }

      const updateSql = 'UPDATE recipes SET status = ? WHERE id = ?';
      const [result] = await db.query(updateSql, ['publicada', recipeId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Receta no encontrada' });
      }

      res.json({ success: true, message: 'Receta aprobada correctamente' });
    } catch (error) {
      console.error('Error en approveRecipe:', error);
      res.status(500).json({ success: false, message: 'Error al aprobar receta', error: error.message });
    }
  }

  static async rejectRecipe(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const recipeId = parseInt(id, 10);

      if (isNaN(recipeId)) {
        return res.status(400).json({ success: false, message: 'ID de receta inválido' });
      }

      const updateSql = 'UPDATE recipes SET status = ? WHERE id = ?';
      const [result] = await db.query(updateSql, ['rechazada', recipeId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Receta no encontrada' });
      }

      res.json({ success: true, message: 'Receta rechazada correctamente' });
    } catch (error) {
      console.error('Error en rejectRecipe:', error);
      res.status(500).json({ success: false, message: 'Error al rechazar receta', error: error.message });
    }
  }

  static async deleteRecipe(req, res) {
    try {
      const { id } = req.params;
      const recipeId = parseInt(id, 10);

      if (isNaN(recipeId)) {
        return res.status(400).json({ success: false, message: 'ID de receta inválido' });
      }

      const deleteSql = 'DELETE FROM recipes WHERE id = ?';
      const [result] = await db.query(deleteSql, [recipeId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Receta no encontrada' });
      }

      res.json({ success: true, message: 'Receta eliminada correctamente' });
    } catch (error) {
      console.error('Error en deleteRecipe:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar receta', error: error.message });
    }
  }

  // ========== GESTIÓN DE USUARIOS ==========
  static async getUsers(req, res) {
    try {
      const sql = `
        SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.is_active, u.created_at,
               COUNT(r.id) as recipe_count
        FROM users u
        LEFT JOIN recipes r ON u.id = r.user_id
        GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.is_active, u.created_at
        ORDER BY u.created_at DESC
      `;
      const [users] = await db.query(sql);
      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Error en getUsers:', error);
      res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message });
    }
  }

  static async toggleUserActive(req, res) {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);

      if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: 'ID de usuario inválido' });
      }

      // Obtener estado actual
      const [user] = await db.query('SELECT is_active FROM users WHERE id = ?', [userId]);
      if (user.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const newStatus = user[0].is_active ? 0 : 1;
      const updateSql = 'UPDATE users SET is_active = ? WHERE id = ?';
      await db.query(updateSql, [newStatus, userId]);

      res.json({ success: true, message: `Usuario ${newStatus ? 'activado' : 'desactivado'}` });
    } catch (error) {
      console.error('Error en toggleUserActive:', error);
      res.status(500).json({ success: false, message: 'Error al cambiar estado del usuario', error: error.message });
    }
  }

  // ========== GESTIÓN DE CATEGORÍAS ==========
  static async getCategories(req, res) {
    try {
      const sql = `
        SELECT c.id, c.name, c.description, c.color, c.is_active,
               COUNT(r.id) as recipe_count
        FROM categories c
        LEFT JOIN recipes r ON c.id = r.category_id
        GROUP BY c.id, c.name, c.description, c.color, c.is_active
        ORDER BY c.name
      `;
      const [categories] = await db.query(sql);
      res.json({ success: true, data: categories });
    } catch (error) {
      console.error('Error en getCategories:', error);
      res.status(500).json({ success: false, message: 'Error al obtener categorías', error: error.message });
    }
  }

  static async createCategory(req, res) {
    try {
      const { name, description, color } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'El nombre es requerido' });
      }

      const sql = 'INSERT INTO categories (name, description, color) VALUES (?, ?, ?)';
      const [result] = await db.query(sql, [name, description || null, color || null]);

      res.status(201).json({ 
        success: true, 
        message: 'Categoría creada correctamente',
        data: { id: result.insertId, name, description, color }
      });
    } catch (error) {
      console.error('Error en createCategory:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'La categoría ya existe' });
      }
      res.status(500).json({ success: false, message: 'Error al crear categoría', error: error.message });
    }
  }

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description, color, is_active } = req.body;
      const categoryId = parseInt(id, 10);

      if (isNaN(categoryId)) {
        return res.status(400).json({ success: false, message: 'ID de categoría inválido' });
      }

      const sql = 'UPDATE categories SET name = ?, description = ?, color = ?, is_active = ? WHERE id = ?';
      const [result] = await db.query(sql, [name, description, color, is_active, categoryId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      }

      res.json({ success: true, message: 'Categoría actualizada correctamente' });
    } catch (error) {
      console.error('Error en updateCategory:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar categoría', error: error.message });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id, 10);

      if (isNaN(categoryId)) {
        return res.status(400).json({ success: false, message: 'ID de categoría inválido' });
      }

      const deleteSql = 'DELETE FROM categories WHERE id = ?';
      const [result] = await db.query(deleteSql, [categoryId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      }

      res.json({ success: true, message: 'Categoría eliminada correctamente' });
    } catch (error) {
      console.error('Error en deleteCategory:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar categoría', error: error.message });
    }
  }

  // ========== ACTUALIZAR ESTADO DE RECETA ==========
  static async updateRecipeStatus(req, res) {
    try {
      const recipeId = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (isNaN(recipeId)) {
        return res.status(400).json({ success: false, message: 'ID de receta inválido' });
      }

      // Validar que el status sea válido
      const validStatuses = ['pendiente', 'publicada', 'rechazada'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Estado inválido' });
      }

      // Actualizar el status
      const updateSql = `UPDATE recipes SET status = ?, updated_at = NOW() WHERE id = ?`;
      const [result] = await db.query(updateSql, [status, recipeId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Receta no encontrada' });
      }

      res.json({ success: true, message: 'Estado de receta actualizado correctamente', data: { id: recipeId, status } });
    } catch (error) {
      console.error('Error en updateRecipeStatus:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar estado de receta', error: error.message });
    }
  }
}

module.exports = AdminController;
