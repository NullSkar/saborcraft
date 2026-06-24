const Rating = require("../models/Rating");

class RatingController {

  static async create(req, res) {
    try {
      const data = req.body;
      if (!data || Object.keys(data).length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Datos de rating requeridos" });
      }
      const rating = await Rating.create(data);
      return res
        .status(201)
        .json({
          success: true,
          message: "Rating creado correctamente",
          data: rating,
        });
    } catch (error) {
      console.error("Error en create:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Error creando rating",
          error: error.message,
        });
    }
  }

  static async update(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id))
        return res
          .status(400)
          .json({ success: false, message: "ID de rating inválido" });
      const updateData = req.body;
      if (!updateData || Object.keys(updateData).length === 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Datos de actualización requeridos",
          });
      }
      const rating = await Rating.update(id, updateData);
      if (!rating) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Rating no encontrado o no actualizado",
          });
      }
      return res.json({
        success: true,
        message: "Rating actualizado correctamente",
        data: rating,
      });
    } catch (error) {
      console.error("Error en update:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Error actualizando rating",
          error: error.message,
        });
    }
  }

  static async delete(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id))
        return res
          .status(400)
          .json({ success: false, message: "ID de rating inválido" });
      await Rating.delete(id);
      return res.json({
        success: true,
        message: "Rating eliminado correctamente",
      });
    } catch (error) {
      console.error("Error en delete:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Error eliminando rating",
          error: error.message,
        });
    }
  }

  // Obtiene todos los ratings asociados a una receta determinada
  static async getByRecipe(req, res) {
    try {
      const recipeId =
        parseInt(req.params.recipeId, 10) || parseInt(req.query.recipeId, 10);
      if (isNaN(recipeId))
        return res
          .status(400)
          .json({ success: false, message: "ID de receta inválido" });
      const ratings = await Rating.findByRecipe(recipeId);
      return res.json({ success: true, count: ratings.length, data: ratings });
    } catch (error) {
      console.error("Error en getByRecipe:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Error obteniendo ratings",
          error: error.message,
        });
    }
  }
}

module.exports = RatingController;
