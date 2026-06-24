import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Interceptor para agregar Basic Auth a todas las requests
api.interceptors.request.use((config) => {
    const credentials = sessionStorage.getItem('auth_credentials')
    if (credentials) {
        const base64 = btoa(credentials) // Codificar en Base64
        config.headers.Authorization = `Basic ${base64}`
    }
    return config
}, (error) => {
    return Promise.reject(error)
})

export const authService = {
    async register(username, email, password, firstName, lastName) {
        try {
            const response = await api.post('/auth/register', {
                username,
                email,
                password,
                firstName,
                lastName
            })
            return response.data
        } catch (error) {
            console.error('Error en registro:', error)
            throw error
        }
    },

    async login(username, password) {
        try {
            // Guardar credenciales en sessionStorage como "username:password"
            const credentials = `${username}:${password}`
            sessionStorage.setItem('auth_credentials', credentials)

            const response = await api.post('/auth/login')
            
            // Si el login falla, limpiar credenciales
            if (!response.data.success) {
                sessionStorage.removeItem('auth_credentials')
                throw new Error(response.data.message)
            }

            return response.data
        } catch (error) {
            sessionStorage.removeItem('auth_credentials')
            console.error('Error en login:', error)
            throw error
        }
    },

    async getCurrentUser() {
        try {
            const response = await api.get('/auth/me')
            return response.data
        } catch (error) {
            console.error('Error obteniendo usuario actual:', error)
            throw error
        }
    },

    async updateProfile(userId, data) {
        try {
            const response = await api.put(`/auth/users/${userId}`, data)
            return response.data
        } catch (error) {
            console.error('Error actualizando perfil:', error)
            throw error
        }
    },

    async logout() {
        try {
            const response = await api.post('/auth/logout')
            sessionStorage.removeItem('auth_credentials')
            return response.data
        } catch (error) {
            sessionStorage.removeItem('auth_credentials')
            console.error('Error en logout:', error)
            throw error
        }
    },

    isLoggedIn() {
        return !!sessionStorage.getItem('auth_credentials')
    },

    async isAdmin() {
        try {
            if (!this.isLoggedIn()) {
                return false
            }
            // Intentar acceder a la ruta admin/stats para verificar permisos
            // Si retorna 403, no es admin. Si retorna 401, no está autenticado
            const response = await api.get('/admin/stats')
            return response.data && response.data.success
        } catch (error) {
            // Si el error es 403 (Forbidden), el usuario no es admin
            if (error.response && error.response.status === 403) {
                return false
            }
            // Si el error es otro, retornar false
            console.error('Error verificando admin status:', error.message)
            return false
        }
    }
}

export const recipeService = {
    async getAll(filters = {}) {
        const response = await api.get('/recipes', { params: filters })
        return response.data.data || response.data
    },

    async getById(id) {
        try {
            const response = await api.get(`/recipes/${id}`)
            return response.data
        } catch (error) {
            console.error('Error al obtener receta:', error)
            throw error
        }
    },

    async incrementViews(id) {
        try {
            const response = await api.post(`/recipes/${id}/views`)
            return response.data
        } catch (error) {
            console.error('Error al incrementar vistas:', error)
            throw error
        }
    },

    async search(query) {
        try {
            const response = await api.get('/recipes/search', { params: { q: query } })
            return response.data.data || response.data
        } catch (error) {
            console.error('Error al buscar recetas:', error)
            throw error
        }
    },

    async create(recipeData) {
        try {
            const response = await api.post('/recipes', recipeData)
            return response.data
        } catch (error) {
            console.error('Error al crear receta:', error)
            throw error
        }
    },

    async update(id, recipeData) {
        try {
            const response = await api.put(`/recipes/${id}`, recipeData)
            return response.data
        } catch (error) {
            console.error('Error al actualizar receta:', error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await api.delete(`/recipes/${id}`)
            return response.data
        } catch (error) {
            console.error('Error al eliminar receta:', error)
            throw error
        }
    },

    async getPendingRecipes() {
        try {
            const response = await api.get('/recipes/pending')
            return response.data.data || []
        } catch (error) {
            console.error('Error al obtener recetas pendientes:', error)
            throw error
        }
    },

    async getRejectedRecipes() {
        try {
            const response = await api.get('/recipes/rejected')
            return response.data.data || []
        } catch (error) {
            console.error('Error al obtener recetas rechazadas:', error)
            throw error
        }
    },

    async submitRating(recipeId, rating) {
        try {
            const currentUser = await authService.getCurrentUser()
            const userId = currentUser.id || currentUser.data?.id
            
            const response = await api.post('/ratings', {
                recipeId,
                userId,
                rating
            })
            return response.data
        } catch (error) {
            console.error('Error al calificar receta:', error)
            throw error
        }
    }
}

export const ingredientService = {
    async getAll() {
        try {
            const response = await api.get('/ingredients')
            return response.data.data || []
        } catch (error) {
            console.error('Error al obtener ingredientes:', error)
            throw error
        }
    },

    async search(term) {
        try {
            if (!term || term.trim().length === 0) {
                return []
            }
            const response = await api.get(`/ingredients/search/${term}`)
            return response.data.data || []
        } catch (error) {
            console.error('Error al buscar ingredientes:', error)
            throw error
        }
    }
}

export const categoryService = {
    async getAll() {
        try {
            const response = await api.get('/categories')
            return response.data.data || []
        } catch (error) {
            console.error('Error al obtener categorías:', error)
            throw error
        }
    }
}

export const ratingService = {
    async getByRecipe(recipeId) {
        try {
            const response = await api.get(`/ratings/recipe/${recipeId}`)
            return response.data.data || []
        } catch (error) {
            console.error('Error al obtener ratings:', error)
            throw error
        }
    },

    async create(recipeId, rating) {
        try {
            const currentUser = await authService.getCurrentUser()
            const userId = currentUser.id || currentUser.data?.id
            
            const response = await api.post('/ratings', {
                recipeId,
                userId,
                rating
            })
            return response.data
        } catch (error) {
            console.error('Error al crear rating:', error)
            throw error
        }
    },

    async update(ratingId, rating) {
        try {
            const response = await api.put(`/ratings/${ratingId}`, {
                rating
            })
            return response.data
        } catch (error) {
            console.error('Error al actualizar rating:', error)
            throw error
        }
    },

    async delete(ratingId) {
        try {
            const response = await api.delete(`/ratings/${ratingId}`)
            return response.data
        } catch (error) {
            console.error('Error al eliminar rating:', error)
            throw error
        }
    }
}

export const favoriteService = {
    async addFavorite(recipeId) {
        try {
            const response = await api.post('/favorites', {
                recipeId
            })
            return response.data
        } catch (error) {
            console.error('Error al agregar a favoritos:', error)
            throw error
        }
    },

    async removeFavorite(recipeId) {
        try {
            const response = await api.delete(`/favorites/${recipeId}`)
            return response.data
        } catch (error) {
            console.error('Error al eliminar de favoritos:', error)
            throw error
        }
    },

    async getUserFavorites(userId) {
        try {
            const response = await api.get(`/favorites/user/${userId}`)
            return response.data.data || []
        } catch (error) {
            console.error('Error al obtener favoritos:', error)
            throw error
        }
    },

    async isFavorite(recipeId) {
        try {
            const response = await api.get(`/favorites/check/${recipeId}`)
            return response.data.data?.isFavorite || false
        } catch (error) {
            console.error('Error al verificar favorito:', error)
            return false
        }
    }
}

export const adminService = {
    // ========== ESTADÍSTICAS ==========
    async getStats() {
        try {
            const response = await api.get('/admin/stats')
            return response.data.data || {}
        } catch (error) {
            console.error('Error al obtener estadísticas:', error)
            throw error
        }
    },

    // ========== GESTIÓN DE RECETAS ==========
    async getPendingRecipes() {
        try {
            const response = await api.get('/admin/recipes/pending')
            return response.data.data || []
        } catch (error) {
            console.error('Error al obtener recetas pendientes:', error)
            throw error
        }
    },

    async getAllRecipes(page = 1, limit = 10) {
        try {
            const response = await api.get('/admin/recipes', {
                params: { page, limit }
            })
            return response.data
        } catch (error) {
            console.error('Error al obtener recetas:', error)
            throw error
        }
    },

    async approveRecipe(recipeId) {
        try {
            const response = await api.post(`/admin/recipes/${recipeId}/approve`)
            return response.data
        } catch (error) {
            console.error('Error al aprobar receta:', error)
            throw error
        }
    },

    async rejectRecipe(recipeId, reason = '') {
        try {
            const response = await api.post(`/admin/recipes/${recipeId}/reject`, { reason })
            return response.data
        } catch (error) {
            console.error('Error al rechazar receta:', error)
            throw error
        }
    },

    async updateRecipeStatus(recipeId, status) {
        try {
            const response = await api.put(`/admin/recipes/${recipeId}/status`, { status })
            return response.data
        } catch (error) {
            console.error('Error al actualizar estado de receta:', error)
            throw error
        }
    },

    async deleteRecipe(recipeId) {
        try {
            const response = await api.delete(`/admin/recipes/${recipeId}`)
            return response.data
        } catch (error) {
            console.error('Error al eliminar receta:', error)
            throw error
        }
    },

    // ========== GESTIÓN DE USUARIOS ==========
    async getUsers() {
        try {
            const response = await api.get('/admin/users')
            return response.data.data || []
        } catch (error) {
            console.error('Error al obtener usuarios:', error)
            throw error
        }
    },

    async toggleUserActive(userId) {
        try {
            const response = await api.post(`/admin/users/${userId}/toggle-active`)
            return response.data
        } catch (error) {
            console.error('Error al cambiar estado del usuario:', error)
            throw error
        }
    },

    // ========== GESTIÓN DE CATEGORÍAS ==========
    async getCategories() {
        try {
            const response = await api.get('/admin/categories')
            return response.data.data || []
        } catch (error) {
            console.error('Error al obtener categorías:', error)
            throw error
        }
    },

    async createCategory(name, description, color) {
        try {
            const response = await api.post('/admin/categories', {
                name,
                description,
                color
            })
            return response.data
        } catch (error) {
            console.error('Error al crear categoría:', error)
            throw error
        }
    },

    async updateCategory(categoryId, name, description, color, is_active) {
        try {
            const response = await api.put(`/admin/categories/${categoryId}`, {
                name,
                description,
                color,
                is_active
            })
            return response.data
        } catch (error) {
            console.error('Error al actualizar categoría:', error)
            throw error
        }
    },

    async deleteCategory(categoryId) {
        try {
            const response = await api.delete(`/admin/categories/${categoryId}`)
            return response.data
        } catch (error) {
            console.error('Error al eliminar categoría:', error)
            throw error
        }
    }
}

export default api