const db = require('../config/database');

class Rating {
  constructor(row) {
    this.id = row.id;
    this.recipeId = row.recipe_id;
    this.userId = row.user_id;
    this.rating = row.rating;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  static async findByRecipe(recipeId) {
    const sql = 'SELECT * FROM ratings WHERE recipe_id = ? ORDER BY created_at DESC';
    const [rows] = await db.query(sql, [recipeId]);
    return rows.map(row => new Rating(row));
  }

  static async findByUser(userId) {
    const sql = 'SELECT * FROM ratings WHERE user_id = ? ORDER BY created_at DESC';
    const [rows] = await db.query(sql, [userId]);
    return rows.map(row => new Rating(row));
  }

  static async findById(id) {
    const sql = 'SELECT * FROM ratings WHERE id = ?';
    const [rows] = await db.query(sql, [id]);
    if (rows.length === 0) return null;
    return new Rating(rows[0]);
  }

  // Create a new rating or update existing
  static async create(data) {
    const { recipeId, userId, rating } = data;
    
    // Primero verificar si ya existe una calificación del usuario para esta receta
    const existingSql = 'SELECT id FROM ratings WHERE recipe_id = ? AND user_id = ?';
    const [existing] = await db.query(existingSql, [recipeId, userId]);
    
    if (existing.length > 0) {
      // Si existe, actualizar
      const ratingId = existing[0].id;
      const updateSql = `
        UPDATE ratings SET 
          rating = ?,
          updated_at = NOW()
        WHERE id = ?
      `;
      await db.query(updateSql, [rating, ratingId]);
      return Rating.findById(ratingId);
    } else {
      // Si no existe, crear nueva
      const insertSql = `
        INSERT INTO ratings (recipe_id, user_id, rating, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
      `;
      const [result] = await db.query(insertSql, [recipeId, userId, rating]);
      return Rating.findById(result.insertId);
    }
  }

  static async update(id, data) {
    const { rating } = data;
    const sql = `
      UPDATE ratings SET 
        rating = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
    await db.query(sql, [rating, id]);
    return this.findById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM ratings WHERE id = ?';
    await db.query(sql, [id]);
    return true;
  }


  async getUser() {
    const User = require('./User');
    return User.findById(this.userId);
  }


  async getRecipe() {
    const Recipe = require('./Recipe');
    return Recipe.findById(this.recipeId);
  }
}

module.exports = Rating;
