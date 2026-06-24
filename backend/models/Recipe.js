const db = require("../config/database");

class Recipe {
  constructor(row) {
    this.id = row.id;
    this.title = row.title;
    this.description = row.description;
    // Si image es un Buffer (BLOB), convertir a base64/string
    this.image = row.image ? this._bufferToBase64(row.image) : null;
    this.prepTime = row.prep_time;
    this.cookTime = row.cook_time;
    this.totalTime = row.total_time;
    this.servings = row.servings;
    this.difficulty = row.difficulty;
    this.status = row.status;
    this.viewsCount = row.views_count;
    this.averageRating = row.average_rating;
    this.ratingsCount = row.ratings_count;
    this.userId = row.user_id;
    this.categoryId = row.category_id;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
    // Datos relacionados (se asignan después si es necesario)
    this.author = null;
    this.category = null;
  }

  _bufferToBase64(buffer) {
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

  static async findById(id) {
    const sql = `
      SELECT r.*,
             u.id as author_id, u.username as author_username, u.first_name as author_first_name, u.last_name as author_last_name, u.avatar as author_avatar,
             c.id as category_id, c.name as category_name, c.color as category_color
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    if (!rows || rows.length === 0) return null;
    
    const row = rows[0];
    const recipe = new Recipe(row);
    recipe.author = {
      id: row.author_id,
      username: row.author_username || 'Desconocido',
      firstName: row.author_first_name || '',
      lastName: row.author_last_name || '',
      avatar: row.author_avatar ? this._bufferToBase64(row.author_avatar) : null
    };
    recipe.category = {
      id: row.category_id,
      name: row.category_name || 'Sin categoría',
      color: row.category_color || '#FF8B41'
    };
    return recipe;
  }

  static async incrementViews(id) {
    try {
      const updateSql =
        "UPDATE recipes SET views_count = views_count + 1 WHERE id = ?";
      await db.query(updateSql, [id]);
      
      const [rows] = await db.query(
        "SELECT views_count FROM recipes WHERE id = ?",
        [id]
      );
      return rows[0] ? rows[0].views_count : null;
    } catch (error) {
      console.error("Error en Recipe.incrementViews:", error);
      throw error;
    }
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT r.*, 
             u.id as author_id, u.username as author_username, u.first_name as author_first_name, u.last_name as author_last_name, u.avatar as author_avatar,
             c.id as category_id, c.name as category_name, c.color as category_color
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      sql += " AND r.status = ?";
      params.push(filters.status);
    }
    if (filters.categoryId) {
      sql += " AND r.category_id = ?";
      params.push(filters.categoryId);
    }
    if (filters.difficulty) {
      sql += " AND r.difficulty = ?";
      params.push(filters.difficulty);
    }
    if (filters.userId) {
      sql += " AND r.user_id = ?";
      params.push(filters.userId);
    }

    const [rows] = await db.query(sql, params);
    return rows.map(row => {
      const recipe = new Recipe(row);
      recipe.author = {
        id: row.author_id,
        username: row.author_username || 'Desconocido',
        firstName: row.author_first_name || '',
        lastName: row.author_last_name || '',
        avatar: row.author_avatar ? this._bufferToBase64(row.author_avatar) : null
      };
      recipe.category = {
        id: row.category_id,
        name: row.category_name || 'Sin categoría',
        color: row.category_color || '#FF8B41'
      };
      return recipe;
    });
  }

  // Search recipes by title or description with author and category info
  static async search(term) {
    const sql = `
      SELECT r.*,
             u.id as author_id, u.username as author_username, u.first_name as author_first_name, u.last_name as author_last_name, u.avatar as author_avatar,
             c.id as category_id, c.name as category_name, c.color as category_color
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE (r.title LIKE ? OR r.description LIKE ?) AND r.status = 'publicada'
      LIMIT 20
    `;
    const searchTerm = `%${term}%`;
    const [rows] = await db.query(sql, [searchTerm, searchTerm]);
    return rows.map(row => {
      const recipe = new Recipe(row);
      recipe.author = {
        id: row.author_id,
        username: row.author_username || 'Desconocido',
        firstName: row.author_first_name || '',
        lastName: row.author_last_name || '',
        avatar: row.author_avatar ? this._bufferToBase64(row.author_avatar) : null
      };
      recipe.category = {
        id: row.category_id,
        name: row.category_name || 'Sin categoría',
        color: row.category_color || '#FF8B41'
      };
      return recipe;
    });
  }

  // Get ingredients for a recipe
  async getIngredients() {
    const sql = `
      SELECT ri.id, ri.quantity, ri.measurement, ri.notes, ri.is_optional,
             i.id as ingredientId, i.name
      FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = ?
    `;
    const [rows] = await db.query(sql, [this.id]);
    return rows.map(row => ({
      id: row.id,
      quantity: row.quantity,
      measurement: row.measurement,
      notes: row.notes,
      isOptional: row.is_optional === 1,
      ingredient: {
        id: row.ingredientId,
        name: row.name
      }
    }));
  }

  // Get instructions for a recipe
  async getInstructions() {
    const sql = `
      SELECT id, step_number as stepNumber, instruction, timer_minutes as timerMinutes
      FROM recipe_instructions 
      WHERE recipe_id = ? 
      ORDER BY step_number
    `;
    const [rows] = await db.query(sql, [this.id]);
    return rows.map(row => ({
      id: row.id,
      stepNumber: row.stepNumber,
      instruction: row.instruction,
      timerMinutes: row.timerMinutes
    }));
  }

  // Delete a recipe
  static async delete(id) {
    const sql = "DELETE FROM recipes WHERE id = ?";
    await db.query(sql, [id]);
    return true;
  }

  // Create a new recipe
  static async create(data) {
    const {
      title,
      description,
      image,
      prepTime,
      cookTime,
      servings,
      difficulty,
      status,
      userId,
      categoryId,
      instructions,
      ingredients,
    } = data;

    const sql = `
      INSERT INTO recipes (
        title, description, image, prep_time, cook_time, servings, 
        difficulty, status, views_count, average_rating, user_id, category_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, NOW(), NOW())
    `;

    const [result] = await db.query(sql, [
      title,
      description,
      image,
      prepTime,
      cookTime,
      servings,
      difficulty,
      status,
      userId,
      categoryId,
    ]);

    const recipeId = result.insertId;

    // Guardar instrucciones si existen
    if (instructions && Array.isArray(instructions) && instructions.length > 0) {
      const instructionsSql = `
        INSERT INTO recipe_instructions (recipe_id, step_number, instruction, created_at)
        VALUES (?, ?, ?, NOW())
      `;
      for (let i = 0; i < instructions.length; i++) {
        await db.query(instructionsSql, [recipeId, i + 1, instructions[i]]);
      }
    }

    // Guardar ingredientes si existen
    if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
      for (const ingredient of ingredients) {
        // Buscar el ingrediente - primero exacto, luego similar
        let checkIngredientSql = `SELECT id FROM ingredients WHERE LOWER(name) = LOWER(?) LIMIT 1`;
        let [ingredientRows] = await db.query(checkIngredientSql, [ingredient.name]);
        
        // Si no encuentra exacto, buscar similar
        if (ingredientRows.length === 0) {
          checkIngredientSql = `SELECT id FROM ingredients WHERE LOWER(name) LIKE LOWER(?) LIMIT 1`;
          const searchTerm = `%${ingredient.name}%`;
          [ingredientRows] = await db.query(checkIngredientSql, [searchTerm]);
        }
        
        let ingredientId;
        if (ingredientRows.length > 0) {
          ingredientId = ingredientRows[0].id;
        } else {
          // Si no existe, crear el ingrediente
          const createIngredientSql = `
            INSERT INTO ingredients (name, measurement_unit, created_at)
            VALUES (?, ?, NOW())
          `;
          const [ingredientResult] = await db.query(createIngredientSql, [
            ingredient.name,
            ingredient.measurement || 'unidades'
          ]);
          ingredientId = ingredientResult.insertId;
        }

        //insertar la relación en recipe_ingredients
        const recipeIngredientSql = `
          INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, measurement, notes, is_optional, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        await db.query(recipeIngredientSql, [
          recipeId,
          ingredientId,
          ingredient.quantity,
          ingredient.measurement,
          ingredient.notes || null,
          ingredient.isOptional ? 1 : 0
        ]);
      }
    }

    return this.findById(recipeId);
  }

  // Update a recipe
  static async update(id, data) {
    const {
      title,
      description,
      image,
      prepTime,
      cookTime,
      servings,
      difficulty,
      status,
      categoryId,
      instructions,
      ingredients,
    } = data;
    
    // Construir dinámicamente la query SQL para que solo actualice la imagen si fue proporcionada
    let sql = `UPDATE recipes SET `;
    const params = [];
    const updates = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (image !== undefined) {
      updates.push('image = ?');
      params.push(image);
    }
    if (prepTime !== undefined) {
      updates.push('prep_time = ?');
      params.push(prepTime);
    }
    if (cookTime !== undefined) {
      updates.push('cook_time = ?');
      params.push(cookTime);
    }
    if (servings !== undefined) {
      updates.push('servings = ?');
      params.push(servings);
    }
    if (difficulty !== undefined) {
      updates.push('difficulty = ?');
      params.push(difficulty);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (categoryId !== undefined) {
      updates.push('category_id = ?');
      params.push(categoryId);
    }
    
    updates.push('updated_at = NOW()');
    
    sql += updates.join(', ') + ' WHERE id = ?';
    params.push(id);
    
    await db.query(sql, params);

    // Actualizar instrucciones si existen
    if (instructions && Array.isArray(instructions)) {
      // Eliminar instrucciones existentes
      const deleteInstructionsSql = `DELETE FROM recipe_instructions WHERE recipe_id = ?`;
      await db.query(deleteInstructionsSql, [id]);

      // Insertar nuevas instrucciones
      if (instructions.length > 0) {
        const instructionsSql = `
          INSERT INTO recipe_instructions (recipe_id, step_number, instruction, created_at)
          VALUES (?, ?, ?, NOW())
        `;
        for (let i = 0; i < instructions.length; i++) {
          await db.query(instructionsSql, [id, i + 1, instructions[i]]);
        }
      }
    }

    // Actualizar ingredientes si existen
    if (ingredients && Array.isArray(ingredients)) {
      // Eliminar ingredientes existentes
      const deleteIngredientsSql = `DELETE FROM recipe_ingredients WHERE recipe_id = ?`;
      await db.query(deleteIngredientsSql, [id]);

      // Insertar nuevos ingredientes
      if (ingredients.length > 0) {
        for (const ingredient of ingredients) {
          // Buscar el ingrediente - primero exacto, luego similar
          let checkIngredientSql = `SELECT id FROM ingredients WHERE LOWER(name) = LOWER(?) LIMIT 1`;
          let [ingredientRows] = await db.query(checkIngredientSql, [ingredient.name]);
          
          // Si no encuentra exacto, buscar similar
          if (ingredientRows.length === 0) {
            checkIngredientSql = `SELECT id FROM ingredients WHERE LOWER(name) LIKE LOWER(?) LIMIT 1`;
            const searchTerm = `%${ingredient.name}%`;
            [ingredientRows] = await db.query(checkIngredientSql, [searchTerm]);
          }
          
          let ingredientId;
          if (ingredientRows.length > 0) {
            ingredientId = ingredientRows[0].id;
          } else {
            // Si no existe, crear el ingrediente
            const createIngredientSql = `
              INSERT INTO ingredients (name, measurement_unit, created_at)
              VALUES (?, ?, NOW())
            `;
            const [ingredientResult] = await db.query(createIngredientSql, [
              ingredient.name,
              ingredient.measurement || 'unidades'
            ]);
            ingredientId = ingredientResult.insertId;
          }

          //insertar la relación en recipe_ingredients
          const recipeIngredientSql = `
            INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, measurement, notes, is_optional, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
          `;
          await db.query(recipeIngredientSql, [
            id,
            ingredientId,
            ingredient.quantity,
            ingredient.measurement,
            ingredient.notes || null,
            ingredient.isOptional ? 1 : 0
          ]);
        }
      }
    }

    return this.findById(id);
  }

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
}

module.exports = Recipe;