const db = require('../config/database');

class Favorite {
  static _bufferToBase64(buffer) {
    if (!buffer) return null;
    if (typeof buffer === 'string') {
      if (buffer.startsWith('data:image')) {
        return buffer;
      }
      return buffer;
    }
    if (Buffer.isBuffer(buffer)) {
      return buffer.toString('utf8');
    }
    return buffer;
  }

  static async findByUserAndRecipe(userId, recipeId) {
    const sql = 'SELECT * FROM favorites WHERE user_id = ? AND recipe_id = ?';
    const [rows] = await db.query(sql, [userId, recipeId]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async findByUser(userId, includeImage = true) {
    let imageField = includeImage ? 'r.image' : 'NULL as image';
    const sql = `
      SELECT 
        r.id, r.title, r.description, ${imageField}, r.prep_time, r.cook_time, 
        r.total_time, r.servings, r.difficulty, r.status, r.views_count, 
        r.average_rating, r.ratings_count, r.user_id, r.category_id, 
        r.created_at, r.updated_at,
        u.username, u.email, u.avatar,
        c.name as category_name
      FROM favorites f
      JOIN recipes r ON f.recipe_id = r.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `;
    const [rows] = await db.query(sql, [userId]);
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      image: this._bufferToBase64(row.image),
      prep_time: row.prep_time,
      cook_time: row.cook_time,
      total_time: row.total_time,
      servings: row.servings,
      difficulty: row.difficulty,
      status: row.status,
      viewsCount: row.views_count,
      averageRating: row.average_rating,
      ratingsCount: row.ratings_count,
      user_id: row.user_id,
      category_id: row.category_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author: {
        id: row.user_id,
        username: row.username,
        email: row.email,
        avatar: this._bufferToBase64(row.avatar)
      },
      category: {
        id: row.category_id,
        name: row.category_name
      }
    }));
  }

  static async findByRecipe(recipeId) {
    const sql = 'SELECT * FROM favorites WHERE recipe_id = ?';
    const [rows] = await db.query(sql, [recipeId]);
    return rows;
  }

  static async create(userId, recipeId) {
    // Verificar que la receta existe
    const checkRecipeSql = 'SELECT id FROM recipes WHERE id = ?';
    const [recipes] = await db.query(checkRecipeSql, [recipeId]);
    if (recipes.length === 0) {
      throw new Error('Recipe not found');
    }

    // Verificar si ya existe
    const existing = await this.findByUserAndRecipe(userId, recipeId);
    if (existing) {
      return existing;
    }

    const sql = 'INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)';
    const [result] = await db.query(sql, [userId, recipeId]);
    return this.findByUserAndRecipe(userId, recipeId);
  }

  static async delete(userId, recipeId) {
    const sql = 'DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?';
    const [result] = await db.query(sql, [userId, recipeId]);
    return result.affectedRows > 0;
  }

  static async deleteById(id) {
    const sql = 'DELETE FROM favorites WHERE id = ?';
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async isFavorite(userId, recipeId) {
    const favorite = await this.findByUserAndRecipe(userId, recipeId);
    return favorite !== null;
  }
}

module.exports = Favorite;
