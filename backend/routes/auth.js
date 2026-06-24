const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const basicAuth = require('../middleware/basicAuth');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar un nuevo usuario
 * @access  Public
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login con Basic Auth
 * @access  Public (requiere header Authorization: Basic base64(username:password))
 */
router.post('/login', basicAuth, AuthController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private (requiere Basic Auth)
 */
router.get('/me', basicAuth, AuthController.getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout
 * @access  Private
 */
router.post('/logout', AuthController.logout);

/**
 * @route   PUT /api/auth/users/:id
 * @desc    Actualizar perfil de usuario
 * @access  Private (requiere Basic Auth)
 */
router.put('/users/:id', basicAuth, AuthController.updateProfile);

module.exports = router;
