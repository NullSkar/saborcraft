const User = require('../models/User');

class AuthController {
  // Login con Basic Auth
  static async login(req, res) {
    try {
      const { username, password } = req.basicAuth;


      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }


      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Retornar datos del usuario sin la contraseña
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        isActive: user.isActive
      };

      return res.json({
        success: true,
        message: 'Login successful',
        data: userResponse
      });
    } catch (error) {
      console.error('Error in login:', error);
      return res.status(500).json({
        success: false,
        message: 'Login error',
        error: error.message
      });
    }
  }


  static async register(req, res) {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        });
      }

      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }

      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Crear nuevo usuario
      const userId = await User.create({
        username,
        email,
        password,
        firstName: firstName || '',
        lastName: lastName || '',
        isActive: 1
      });

      const newUser = await User.findById(userId);
      const userResponse = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      };

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: userResponse
      });
    } catch (error) {
      console.error('Error in register:', error);
      return res.status(500).json({
        success: false,
        message: 'Registration error',
        error: error.message
      });
    }
  }


  static async getCurrentUser(req, res) {
    try {
      const { username } = req.basicAuth;

      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Obtener estadísticas del usuario
      const favoritesCount = await user.getFavoritesCount();
      const averageRating = await user.getAverageRating();

      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        isActive: user.isActive,
        stats: {
          favoritesCount,
          averageRating
        }
      };

      return res.json({
        success: true,
        data: userResponse
      });
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message
      });
    }
  }

  // Logout (sin hacer nada en backend para Basic Auth)
  static async logout(req, res) {
    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  // Actualizar perfil de usuario
  static async updateProfile(req, res) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      const { firstName, lastName, bio, avatar } = req.body;

      // Validar que el usuario autenticado es el mismo que intenta actualizar
      if (req.user.id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized - cannot update other users'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('=== updateProfile ===');
      console.log('avatar received:', avatar ? `${avatar.substring(0, 50)}...` : 'null');
      console.log('avatar length:', avatar ? avatar.length : 0);

      // Actualizar usuario
      await User.update(userId, {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        bio: bio || user.bio,
        avatar: avatar || user.avatar
      });

      const updatedUser = await User.findById(userId);
      console.log('updated avatar from db:', updatedUser.avatar ? `${updatedUser.avatar.substring(0, 50)}...` : 'null');
      console.log('===================');
      const userResponse = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio
      };

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: userResponse
      });
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating profile',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;