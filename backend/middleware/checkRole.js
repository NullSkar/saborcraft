const db = require('../config/database');

/**
 * Middleware para verificar si el usuario tiene un rol específico
 * @param {string} requiredRole - Nombre del rol requerido (ej: 'admin')
 */
const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // req.user debe estar disponible (asegurado por basicAuth middleware)
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const userId = req.user.id;

      // Consulta para obtener roles del usuario
      const sql = `
        SELECT r.name
        FROM user_roles ur
        INNER JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
      `;

      const [rows] = await db.query(sql, [userId]);
      const userRoles = rows.map(row => row.name);

      // Verificar si el usuario tiene el rol requerido
      if (!userRoles.includes(requiredRole)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden - Required role: ${requiredRole}`
        });
      }

      // Asignar roles al objeto req para uso posterior
      req.userRoles = userRoles;
      next();
    } catch (error) {
      console.error('Error in checkRole middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Role verification error',
        error: error.message
      });
    }
  };
};

module.exports = checkRole;
