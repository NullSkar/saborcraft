const db = require('../config/database');

class Category {
  constructor(row) {
    this.id = row.id;
    this.name = row.name;
    this.description = row.description;
    this.icon = row.icon;
    this.color = row.color;
    this.isActive = row.is_active;
    this.createdAt = row.created_at;
  }


  static async findAll() {
    const sql = 'SELECT * FROM categories WHERE is_active = 1';
    const [rows] = await db.query(sql);
    return rows.map(row => new Category(row));
  }


  static async findById(id) {
    const sql = 'SELECT * FROM categories WHERE id = ?';
    const [rows] = await db.query(sql, [id]);
    if (rows.length === 0) return null;
    return new Category(rows[0]);
  }


  async getRecipes() {
    const sql = 'SELECT * FROM recipes WHERE category_id = ?';
    const [rows] = await db.query(sql, [this.id]);
    const Recipe = require('./Recipe');
    return rows.map(row => new Recipe(row));
  }
}

module.exports = Category;
