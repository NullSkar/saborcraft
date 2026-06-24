const express = require('express');
const basicAuth = require('../middleware/basicAuth');
const checkRole = require('../middleware/checkRole');
const AdminController = require('../controllers/adminController');

const router = express.Router();


// ========== ESTADÍSTICAS ==========
router.get('/stats', basicAuth, checkRole('admin'), AdminController.getStats);

// ========== GESTIÓN DE RECETAS ==========
router.get('/recipes', basicAuth, checkRole('admin'), AdminController.getAllRecipes);
router.get('/recipes/pending', basicAuth, checkRole('admin'), AdminController.getPendingRecipes);
router.post('/recipes/:id/approve', basicAuth, checkRole('admin'), AdminController.approveRecipe);
router.post('/recipes/:id/reject', basicAuth, checkRole('admin'), AdminController.rejectRecipe);
router.put('/recipes/:id/status', basicAuth, checkRole('admin'), AdminController.updateRecipeStatus);
router.delete('/recipes/:id', basicAuth, checkRole('admin'), AdminController.deleteRecipe);

// ========== GESTIÓN DE USUARIOS ==========
router.get('/users', basicAuth, checkRole('admin'), AdminController.getUsers);
router.post('/users/:id/toggle-active', basicAuth, checkRole('admin'), AdminController.toggleUserActive);

// ========== GESTIÓN DE CATEGORÍAS ==========
router.get('/categories', basicAuth, checkRole('admin'), AdminController.getCategories);
router.post('/categories', basicAuth, checkRole('admin'), AdminController.createCategory);
router.put('/categories/:id', basicAuth, checkRole('admin'), AdminController.updateCategory);
router.delete('/categories/:id', basicAuth, checkRole('admin'), AdminController.deleteCategory);

module.exports = router;
