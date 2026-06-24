const db = require('../config/database');

class Ingredient {
  constructor(row) {
    this.id = row.id;
    this.name = row.name;
    this.description = row.description;
    this.measurementUnit = row.measurement_unit;
    this.isActive = row.is_active;
    this.createdAt = row.created_at;
  }

  static async findAll() {
    const sql = 'SELECT * FROM ingredients WHERE is_active = 1';
    const [rows] = await db.query(sql);
    return rows.map(row => new Ingredient(row));
  }

  static async findById(id) {
    const sql = 'SELECT * FROM ingredients WHERE id = ?';
    const [rows] = await db.query(sql, [id]);
    if (rows.length === 0) return null;
    return new Ingredient(rows[0]);
  }

  static async search(term) {
    const sql = 'SELECT * FROM ingredients WHERE (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)) AND is_active = 1 ORDER BY name';
    const searchTerm = `%${term}%`;
    const [rows] = await db.query(sql, [searchTerm, searchTerm]);
    return rows.map(row => new Ingredient(row));
  }
}

module.exports = Ingredient;
