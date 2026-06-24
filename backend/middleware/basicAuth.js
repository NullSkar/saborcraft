const db = require('../config/database');

const basicAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Basic Auth required'
    });
  }

  // Decodificar Base64
  const base64Credentials = authHeader.slice(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  if (!username || !password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials format'
    });
  }

  try {
    // Buscar usuario en la BD
    const sql = 'SELECT id, username, email, first_name, last_name, password FROM users WHERE username = ? OR email = ?';
    const [rows] = await db.query(sql, [username, username]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = rows[0];


    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Asignar usuario autenticado a req.user
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    };

    // Guardar también en req.basicAuth para compatibilidad
    req.basicAuth = { username, password };
    next();
  } catch (error) {
    console.error('Error in basicAuth middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

module.exports = basicAuth;
