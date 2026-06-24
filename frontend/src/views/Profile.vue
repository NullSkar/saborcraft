<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService, recipeService, favoriteService } from '../services/api'

const router = useRouter()
const currentUser = ref({
  id: null,
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  avatar: null,
  bio: '',
  stats: {
    favoritesCount: 0,
    averageRating: 0
  }
})
const userRecipes = ref([])
const userFavorites = ref([])
const pendingRecipes = ref([])
const rejectedRecipes = ref([])
const recipesDisplayed = ref(3)
const isLoading = ref(true)
const error = ref('')
const activeTab = ref('recipes') // 'recipes', 'pending', 'rejected' o 'favorites'

// Computed para obtener las recetas a mostrar (paginadas)
const displayedRecipes = computed(() => {
  return userRecipes.value.slice(0, recipesDisplayed.value)
})

// Computed para obtener total de visualizaciones
const totalViews = computed(() => {
  return userRecipes.value.reduce((sum, recipe) => sum + (recipe.viewsCount || 0), 0)
})

// Computed para obtener total de "me gusta" (suma de ratings)
const totalLikes = computed(() => {
  return userRecipes.value.reduce((sum, recipe) => sum + (recipe.ratingsCount || 0), 0)
})

onMounted(async () => {
  // Verificar que está logueado
  if (!authService.isLoggedIn()) {
    router.push('/login')
    return
  }

  try {
    // Obtener datos del usuario actual
    const response = await authService.getCurrentUser()
    
    const userData = response.data || response
    console.log('Profile - Response from getCurrentUser:', response)
    
    if (userData && userData.id) {
      currentUser.value = {
        id: userData.id || '',
        username: userData.username || '',
        email: userData.email || '',
        firstName: userData.first_name || userData.firstName || '',
        lastName: userData.last_name || userData.lastName || '',
        avatar: userData.avatar || '',
        bio: userData.bio || '',
        stats: userData.stats || { favoritesCount: 0, averageRating: 0 }
      }
    }

    // Obtener recetas del usuario
    if (currentUser.value.id) {
      const recipes = await recipeService.getAll({ userId: currentUser.value.id })
      userRecipes.value = Array.isArray(recipes) ? recipes : recipes.data || []
      
      // Obtener favoritos del usuario
      const favResponse = await favoriteService.getUserFavorites(currentUser.value.id)
      userFavorites.value = Array.isArray(favResponse) ? favResponse : []

      // Obtener recetas pendientes del usuario
      const pendingResponse = await recipeService.getPendingRecipes()
      pendingRecipes.value = Array.isArray(pendingResponse) ? pendingResponse : []

      // Obtener recetas rechazadas del usuario
      const rejectedResponse = await recipeService.getRejectedRecipes()
      rejectedRecipes.value = Array.isArray(rejectedResponse) ? rejectedResponse : []
    }
  } catch (err) {
    console.error('Error cargando perfil:', err)
    error.value = 'Error al cargar el perfil'
  } finally {
    isLoading.value = false
  }
})

const getFullName = () => {
  return currentUser.value.username || 'Usuario'
}

const getAverageRating = () => {
  const rating = currentUser.value.stats?.averageRating
  if (!rating && rating !== 0) return '0.0'
  return Number(rating).toFixed(1)
}

const loadMoreRecipes = () => {
  recipesDisplayed.value += 3
}

const deleteRecipe = async (recipeId) => {
  if (!window.confirm('¿Estás seguro de que deseas eliminar esta receta? Esta acción no se puede deshacer.')) {
    return
  }

  try {
    const response = await recipeService.delete(recipeId)
    if (response.success) {
      userRecipes.value = userRecipes.value.filter(r => r.id !== recipeId)
      pendingRecipes.value = pendingRecipes.value.filter(r => r.id !== recipeId)
      rejectedRecipes.value = rejectedRecipes.value.filter(r => r.id !== recipeId)
    }
  } catch (err) {
    console.error('Error al eliminar receta:', err)
    error.value = 'Error al eliminar la receta'
  }
}

const removeFavorite = async (recipeId) => {
  try {
    await favoriteService.removeFavorite(recipeId)
    userFavorites.value = userFavorites.value.filter(r => r.id !== recipeId)
  } catch (err) {
    console.error('Error al eliminar favorito:', err)
    error.value = 'Error al eliminar el favorito'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center h-screen">
      <div class="text-center">
        <svg class="w-16 h-16 text-light-primary animate-spin mx-auto mb-4" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        <p class="text-gray-600">Cargando perfil...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-6xl mx-auto px-4 py-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {{ error }}
      </div>
    </div>

    <!-- Contenido Principal -->
    <div v-else class="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <div class="flex flex-col md:flex-row gap-6 md:gap-8">
        <!-- ASIDE IZQUIERDO -->
        <aside class="w-full md:w-80 order-2 md:order-1">
          <div class="bg-white rounded-lg shadow-md p-6">
            <!-- Avatar -->
            <div class="flex justify-center mb-4">
              <div v-if="currentUser.avatar" class="w-24 md:w-32 h-24 md:h-32 rounded-full overflow-hidden bg-gray-300">
                <img :src="currentUser.avatar" :alt="getFullName()" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-24 md:w-32 h-24 md:h-32 rounded-full bg-light-primary flex items-center justify-center text-white text-3xl md:text-5xl font-bold">
                {{ currentUser.username?.charAt(0).toUpperCase() || 'U' }}
              </div>
            </div>

            <!-- Nombre de Usuario -->
            <h2 class="text-xl md:text-2xl font-bold text-center text-gray-900">{{ getFullName() }}</h2>
            <p class="text-center text-gray-600 text-xs md:text-sm">@{{ currentUser.username }}</p>

            <!-- Bio -->
            <div v-if="currentUser.bio" class="mt-4 p-4 bg-gray-50 rounded text-xs md:text-sm text-gray-700">
              {{ currentUser.bio }}
            </div>

            <!-- Separador -->
            <div class="border-t border-gray-200 my-6"></div>

            <!-- Bloque de Recetas y Favoritos -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="text-center">
                <p class="text-2xl md:text-3xl font-bold text-light-primary">{{ userRecipes.length }}</p>
                <p class="text-xs md:text-sm text-gray-600">Recetas creadas</p>
              </div>
              <div class="text-center">
                <p class="text-2xl md:text-3xl font-bold text-light-primary">{{ currentUser.stats?.favoritesCount || 0 }}</p>
                <p class="text-xs md:text-sm text-gray-600">Favoritos</p>
              </div>
            </div>

            <!-- Separador -->
            <div class="border-t border-gray-200 my-6"></div>

            <!-- Navegación -->
            <nav class="overflow-hidden">
              <button class="w-full px-6 py-3 text-left font-medium text-light-primary hover:bg-gray-50 transition border-l-4 border-light-primary text-sm md:text-base">
                Resumen
              </button>
            </nav>
          </div>
        </aside>

        <!-- MAIN CONTENT -->
        <main class="flex-1 order-1 md:order-2">
          <!-- Bienvenida -->
          <div class="p-4 md:p-8 mb-4 md:mb-6">
            <h1 class="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
              Bienvenido de vuelta {{ currentUser.firstName || getFullName() }}
            </h1>
            <p class="text-sm md:text-base text-gray-600">Aquí tienes un resumen de tu actividad</p>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
            <div class="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
              <p class="text-2xl md:text-3xl font-bold text-light-primary">{{ userRecipes.length }}</p>
              <p class="text-xs md:text-sm text-gray-600 mt-2">Recetas publicadas</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
              <p class="text-2xl md:text-3xl font-bold text-light-primary">{{ totalLikes }}</p>
              <p class="text-xs md:text-sm text-gray-600 mt-2">Me gusta totales</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
              <p class="text-2xl md:text-3xl font-bold text-light-primary">{{ totalViews }}</p>
              <p class="text-xs md:text-sm text-gray-600 mt-2">Visualizaciones</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
              <p class="text-2xl md:text-3xl font-bold text-light-primary">{{ getAverageRating() }}</p>
              <p class="text-xs md:text-sm text-gray-600 mt-2">Rating promedio</p>
            </div>
          </div>

          <!-- Acciones Rápidas y Recetas Más Populares -->
          <div class="bg-white rounded-lg shadow-md p-4 md:p-6">
            <!-- Acciones Rápidas -->
            <div class="mb-6 md:mb-8">
              <h2 class="text-lg md:text-xl font-bold text-gray-900 mb-4">Acciones rápidas</h2>
              <div class="flex flex-col md:flex-row gap-2 md:gap-4">
                <router-link
                  to="/recipes/create"
                  class="flex-1 px-4 md:px-6 py-2 md:py-3 bg-light-primary text-white rounded-lg hover:bg-light-tertiary transition font-medium text-center text-sm md:text-base"
                >
                  Crear nueva receta
                </router-link>
                <router-link
                  to="/profile/edit"
                  class="flex-1 px-4 md:px-6 py-2 md:py-3 bg-light-secondary text-white rounded-lg hover:bg-light-tertiary transition font-medium text-center text-sm md:text-base"
                >
                  Editar perfil
                </router-link>
              </div>
            </div>

            <!-- Separador -->
            <div class="border-t border-gray-200 my-6 md:my-8"></div>

              <!-- Tabs: Recetas y Favoritos -->
              <div>
                <div class="flex gap-2 md:gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
                  <button
                    @click="activeTab = 'recipes'"
                    :class="activeTab === 'recipes' ? 'border-b-2 border-light-primary text-light-primary' : 'text-gray-600'"
                    class="pb-3 font-semibold transition whitespace-nowrap text-sm md:text-base"
                  >
                    Mis Recetas ({{ userRecipes.length }})
                  </button>
                  <button
                    @click="activeTab = 'pending'"
                    :class="activeTab === 'pending' ? 'border-b-2 border-light-primary text-light-primary' : 'text-gray-600'"
                    class="pb-3 font-semibold transition whitespace-nowrap text-sm md:text-base"
                  >
                    Pendientes ({{ pendingRecipes.length }})
                  </button>
                  <button
                    @click="activeTab = 'rejected'"
                    :class="activeTab === 'rejected' ? 'border-b-2 border-light-primary text-light-primary' : 'text-gray-600'"
                    class="pb-3 font-semibold transition whitespace-nowrap text-sm md:text-base"
                  >
                    Rechazadas ({{ rejectedRecipes.length }})
                  </button>
                  <button
                    @click="activeTab = 'favorites'"
                    :class="activeTab === 'favorites' ? 'border-b-2 border-light-primary text-light-primary' : 'text-gray-600'"
                    class="pb-3 font-semibold transition whitespace-nowrap text-sm md:text-base"
                  >
                    Favoritos ({{ userFavorites.length }})
                  </button>
                </div>              <!-- Recetas Más Populares -->
              <div v-if="activeTab === 'recipes'">
                <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Tus recetas</h3>
            
                <div v-if="displayedRecipes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  <div
                    v-for="recipe in displayedRecipes"
                    :key="recipe.id"
                    class="bg-gray-50 rounded-lg overflow-hidden shadow hover:shadow-lg transition relative group cursor-pointer"
                  >
                    <router-link :to="`/recipes/${recipe.id}`" class="block">
                      <div v-if="recipe.image" class="w-full h-48 overflow-hidden bg-gray-300">
                        <img :src="recipe.image" :alt="recipe.title" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      </div>
                      <div v-else class="w-full h-48 bg-gradient-to-br from-light-primary to-light-secondary flex items-center justify-center">
                        <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div class="p-4">
                        <h3 class="font-bold text-gray-900 line-clamp-2">{{ recipe.title }}</h3>
                        <p class="text-gray-600 text-sm line-clamp-2 mt-2">{{ recipe.description }}</p>
                        <div class="mt-4 flex items-center justify-between text-sm">
                          <span class="text-gray-500">👁️ {{ recipe.viewsCount || 0 }} vistas</span>
                          <span class="text-gray-500">⭐ {{ (Number(recipe.averageRating) || 0).toFixed(1) }}</span>
                        </div>
                      </div>
                    </router-link>

                    <!-- Botones de acción -->
                    <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <router-link
                        :to="`/recipes/${recipe.id}/edit`"
                        class="p-2 bg-light-secondary text-white rounded-full hover:bg-light-tertiary transition shadow-md"
                        title="Editar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </router-link>
                      <button
                        @click="deleteRecipe(recipe.id)"
                        class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-md"
                        title="Eliminar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Botón Ver Más -->
                <div v-if="displayedRecipes.length < userRecipes.length" class="mt-6 md:mt-8 text-center">
                  <button
                    @click="loadMoreRecipes"
                    class="px-6 md:px-8 py-2 md:py-3 bg-light-primary text-white rounded-lg hover:bg-light-tertiary transition font-semibold text-sm md:text-base"
                  >
                    Ver más ({{ userRecipes.length - displayedRecipes.length }} restantes)
                  </button>
                </div>

                <div v-else-if="userRecipes.length === 0" class="text-center py-12">
                  <p class="text-gray-600 mb-4">No tienes recetas aún</p>
                  <router-link
                    to="/recipes/create"
                    class="inline-block px-6 py-2 bg-light-primary text-white rounded-lg hover:bg-light-secondary transition"
                  >
                    Crear tu primera receta
                  </router-link>
                </div>
              </div>

              <!-- Recetas Pendientes -->
              <div v-if="activeTab === 'pending'">
                <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Recetas Pendientes de Aprobación</h3>
            
                <div v-if="pendingRecipes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  <div
                    v-for="recipe in pendingRecipes"
                    :key="recipe.id"
                    class="bg-gray-50 rounded-lg overflow-hidden shadow hover:shadow-lg transition relative group cursor-pointer border border-light-accent/30"
                  >
                    <router-link :to="`/recipes/${recipe.id}`" class="block">
                      <div v-if="recipe.image" class="w-full h-48 overflow-hidden bg-gray-300">
                        <img :src="recipe.image" :alt="recipe.title" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      </div>
                      <div v-else class="w-full h-48 bg-gradient-to-br from-light-primary to-light-secondary flex items-center justify-center">
                        <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div class="p-4">
                        <h3 class="font-bold text-gray-900 line-clamp-2">{{ recipe.title }}</h3>
                        <p class="text-gray-600 text-sm line-clamp-2 mt-2">{{ recipe.description }}</p>
                        <div class="mt-3 flex items-center justify-between text-xs">
                          <span class="px-2 py-1 bg-light-secondary/20 text-light-secondary rounded-full">Pendiente</span>
                          <span class="text-gray-500">👁️ {{ recipe.viewsCount || 0 }}</span>
                        </div>
                      </div>
                    </router-link>

                    <!-- Botones para editar y eliminar -->
                    <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <router-link
                        :to="`/recipes/${recipe.id}/edit`"
                        class="p-2 bg-light-primary text-white rounded-full hover:bg-light-secondary transition shadow-md"
                        title="Editar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </router-link>
                      <button
                        @click="deleteRecipe(recipe.id)"
                        class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-md"
                        title="Eliminar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-12">
                  <p class="text-gray-600 mb-4">No tienes recetas pendientes</p>
                  <p class="text-gray-500 text-sm mb-4">Tus recetas se mostrarán aquí mientras esperan aprobación</p>
                  <router-link
                    to="/recipes/create"
                    class="inline-block px-6 py-2 bg-light-primary text-white rounded-lg hover:bg-light-secondary transition"
                  >
                    Crear una receta
                  </router-link>
                </div>
              </div>

              <!-- Recetas Rechazadas -->
              <div v-if="activeTab === 'rejected'">
                <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Recetas Rechazadas</h3>
            
                <div v-if="rejectedRecipes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  <div
                    v-for="recipe in rejectedRecipes"
                    :key="recipe.id"
                    class="bg-gray-50 rounded-lg overflow-hidden shadow hover:shadow-lg transition relative group cursor-pointer border border-red-200"
                  >
                    <router-link :to="`/recipes/${recipe.id}`" class="block">
                      <div v-if="recipe.image" class="w-full h-48 overflow-hidden bg-gray-300">
                        <img :src="recipe.image" :alt="recipe.title" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      </div>
                      <div v-else class="w-full h-48 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                        <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="p-4">
                        <h3 class="font-bold text-gray-900 line-clamp-2">{{ recipe.title }}</h3>
                        <p class="text-gray-600 text-sm line-clamp-2 mt-2">{{ recipe.description }}</p>
                        <div class="mt-3 flex items-center justify-between text-xs">
                          <span class="px-2 py-1 bg-red-100 text-red-700 rounded-full">Rechazada</span>
                          <span class="text-gray-500">👁️ {{ recipe.viewsCount || 0 }}</span>
                        </div>
                      </div>
                    </router-link>

                    <!-- Botones para editar y eliminar -->
                    <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <router-link
                        :to="`/recipes/${recipe.id}/edit`"
                        class="p-2 bg-light-primary text-white rounded-full hover:bg-light-secondary transition shadow-md"
                        title="Editar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </router-link>
                      <button
                        @click="deleteRecipe(recipe.id)"
                        class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-md"
                        title="Eliminar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-12">
                  <p class="text-gray-600 mb-4">No tienes recetas rechazadas</p>
                  <p class="text-gray-500 text-sm mb-4">Las recetas rechazadas aparecerán aquí</p>
                  <router-link
                    to="/recipes/create"
                    class="inline-block px-6 py-2 bg-light-primary text-white rounded-lg hover:bg-light-secondary transition"
                  >
                    Crear una receta
                  </router-link>
                </div>
              </div>

              <!-- Favoritos -->
              <div v-if="activeTab === 'favorites'">
                <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Tus recetas favoritas</h3>
            
                <div v-if="userFavorites.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  <div
                    v-for="recipe in userFavorites"
                    :key="recipe.id"
                    class="bg-gray-50 rounded-lg overflow-hidden shadow hover:shadow-lg transition relative group cursor-pointer"
                  >
                    <router-link :to="`/recipes/${recipe.id}`" class="block">
                      <div v-if="recipe.image" class="w-full h-48 overflow-hidden bg-gray-300">
                        <img :src="recipe.image" :alt="recipe.title" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      </div>
                      <div v-else class="w-full h-48 bg-gradient-to-br from-light-primary to-light-secondary flex items-center justify-center">
                        <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div class="p-4">
                        <h3 class="font-bold text-gray-900 line-clamp-2">{{ recipe.title }}</h3>
                        <p class="text-gray-600 text-sm line-clamp-2 mt-2">{{ recipe.description }}</p>
                        <div class="mt-4 flex items-center justify-between text-sm">
                          <span class="text-gray-500">👁️ {{ recipe.viewsCount || 0 }} vistas</span>
                          <span class="text-gray-500">⭐ {{ (Number(recipe.averageRating) || 0).toFixed(1) }}</span>
                        </div>
                      </div>
                    </router-link>

                    <!-- Botón para eliminar de favoritos -->
                    <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        @click="removeFavorite(recipe.id)"
                        class="p-2 bg-light-accent text-white rounded-full hover:bg-red-600 transition shadow-md"
                        title="Eliminar de favoritos"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-12">
                  <p class="text-gray-600 mb-4">No tienes recetas favoritas aún</p>
                  <router-link
                    to="/recipes"
                    class="inline-block px-6 py-2 bg-light-primary text-white rounded-lg hover:bg-light-secondary transition"
                  >
                    Explorar recetas
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
