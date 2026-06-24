<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { recipeService, authService, ratingService, favoriteService } from '../services/api'

const route = useRoute()
const router = useRouter()
const recipe = ref(null)
const loading = ref(true)
const error = ref(null)
const userRating = ref(0)
const hoverRating = ref(0)
const isSubmittingRating = ref(false)
const isFavorite = ref(false)
const isLoadingFavorite = ref(false)

// Computed para obtener fecha formateada
const getFormattedDate = () => {
  if (!recipe.value?.createdAt) return ''
  const date = new Date(recipe.value.createdAt)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const getAverageRating = () => {
  const rating = recipe.value?.averageRating
  if (!rating && rating !== 0) return '0.0'
  return (Number(rating) || 0).toFixed(1)
}

async function loadRecipe() {
  const id = parseInt(route.params.id, 10)
  try {
    const response = await recipeService.getById(id)
    recipe.value = response.data || response

    await recipeService.incrementViews(id)
    recipe.value.viewsCount = (recipe.value.viewsCount || 0) + 1

    // Cargar la calificación del usuario actual si está logueado
    if (authService.isLoggedIn()) {
      await loadUserRating(id)
      await loadFavoriteStatus(id)
    }
  } catch (err) {
    console.error('Error cargando receta:', err)
    error.value = 'No se pudo cargar la receta.'
  } finally {
    loading.value = false
  }
}

const loadUserRating = async (recipeId) => {
  try {
    const currentUser = await authService.getCurrentUser()
    const userId = currentUser.id || currentUser.data?.id
    if (!userId) return

    // Obtener todas las calificaciones de la receta
    const ratings = await ratingService.getByRecipe(recipeId)
    
    // Buscar la calificación del usuario actual
    const userRatingData = ratings.find(r => r.userId === userId || r.user_id === userId)
    if (userRatingData) {
      userRating.value = userRatingData.rating || userRatingData.user_rating || 0
    }
  } catch (err) {
    console.error('Error cargando calificación del usuario:', err)
  }
}

const loadFavoriteStatus = async (recipeId) => {
  try {
    isFavorite.value = await favoriteService.isFavorite(recipeId)
  } catch (err) {
    console.error('Error cargando estado de favorito:', err)
  }
}

const getAuthorName = () => {
  if (!recipe.value?.author) return 'Autor desconocido'
  return recipe.value.author.username || 'Autor desconocido'
}

const goBack = () => {
  router.back()
}

// Rating interactivo
const submitRating = async (rating) => {
  if (!recipe.value?.id) return
  
  isSubmittingRating.value = true
  try {
    await recipeService.submitRating(recipe.value.id, rating)
    userRating.value = rating
    
    // Recargar datos de la receta para obtener el nuevo promedio
    const id = parseInt(route.params.id, 10)
    const response = await recipeService.getById(id)
    recipe.value = response.data || response
  } catch (err) {
    console.error('Error al calificar:', err)
  } finally {
    isSubmittingRating.value = false
  }
}

// Favoritos
const toggleFavorite = async () => {
  if (!recipe.value?.id) return
  
  if (!authService.isLoggedIn()) {
    alert('Debes iniciar sesión para agregar favoritos')
    return
  }

  try {
    isLoadingFavorite.value = true
    if (isFavorite.value) {
      await favoriteService.removeFavorite(recipe.value.id)
    } else {
      await favoriteService.addFavorite(recipe.value.id)
    }
    isFavorite.value = !isFavorite.value
  } catch (error) {
    console.error('Error toggling favorite:', error)
  } finally {
    isLoadingFavorite.value = false
  }
}

onMounted(loadRecipe)
</script>

<template>
  <div class="min-h-screen bg-light-light">
    <!-- Estado de carga -->
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <p class="text-xl text-light-primary">Cargando receta...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex justify-center items-center min-h-screen">
      <p class="text-xl text-red-600">{{ error }}</p>
    </div>

    <!-- Contenido principal -->
    <div v-else-if="recipe" class="w-full">
      <div class="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
        <!-- Botón para volver (solo en móvil, dentro del contenido) -->
        <button
          @click="goBack"
          class="md:hidden mb-4 bg-light-primary text-white px-4 py-2 rounded-lg hover:bg-light-secondary transition"
        >
          ← Volver
        </button>

        <!-- SECCIÓN HEADER: Imagen arriba, Datos abajo (móvil) / Imagen izquierda, Datos derecha (desktop) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
          <!-- Imagen -->
          <div>
            <img
              v-if="recipe.image"
              :src="recipe.image"
              :alt="recipe.title"
              class="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
            <div v-else class="w-full h-64 md:h-96 bg-gradient-to-br from-light-primary to-light-secondary rounded-lg shadow-lg flex items-center justify-center">
              <span class="text-white text-2xl">Sin imagen</span>
            </div>
          </div>

          <!-- Título, descripción, autor y rating -->
          <div class="flex flex-col justify-start">
            <div class="flex items-start justify-between mb-4 gap-2">
              <h1 class="text-3xl md:text-5xl font-bold text-light-primary flex-1">{{ recipe.title }}</h1>
              <!-- Botón Favorito -->
              <button
                @click="toggleFavorite"
                :disabled="isLoadingFavorite"
                class="p-3 rounded-full transition-all duration-200 flex-shrink-0"
                :class="isFavorite ? 'bg-light-accent text-white' : 'bg-light-primary/10 text-light-accent hover:bg-light-primary/20'"
                title="Agregar a favoritos"
              >
                <svg class="w-6 md:w-8 h-6 md:h-8" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            <p class="text-sm md:text-base text-light-primary/70 mb-6 md:mb-8 leading-relaxed">{{ recipe.description }}</p>

            <!-- Autor, fecha y rating -->
            <div class="flex items-center gap-4 mb-6 pb-6 border-b border-light-primary/20">
              <img
                v-if="recipe.author?.avatar"
                :src="recipe.author.avatar"
                :alt="`Avatar de ${recipe.author.username}`"
                class="w-10 md:w-12 h-10 md:h-12 rounded-full object-cover border-2 border-light-accent flex-shrink-0"
              />
              <div v-else class="w-10 md:w-12 h-10 md:h-12 rounded-full bg-light-accent flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0">
                {{ recipe.author?.username?.charAt(0)?.toUpperCase() || 'A' }}
              </div>
              <div class="flex flex-col gap-1">
                <p class="font-semibold text-light-primary text-sm md:text-base">{{ getAuthorName() }}</p>
                <p class="text-xs text-light-primary/60">{{ getFormattedDate() }}</p>
              </div>
            </div>

            <!-- Rating interactivo -->
            <div class="flex items-center gap-3">
              <div class="flex gap-1">
                <button
                  v-for="star in 5"
                  :key="star"
                  @click="submitRating(star)"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                  :disabled="isSubmittingRating"
                  class="text-xl md:text-2xl transition cursor-pointer disabled:opacity-50"
                  :class="(hoverRating || userRating) >= star ? 'text-light-accent' : 'text-light-primary/20'"
                >
                  ★
                </button>
              </div>
              <span class="text-xs md:text-sm font-semibold text-light-primary">
                {{ getAverageRating() }} ({{ recipe.ratingsCount }})
              </span>
            </div>
          </div>
        </div>

        <!-- SECCIÓN INFO: Prep time, cook time, servings -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
          <!-- Tiempo de preparación -->
          <div class="bg-white rounded-lg shadow-md p-4 md:p-6 border-t-4 border-light-primary">
            <div class="text-light-primary/60 text-xs font-bold uppercase tracking-wider mb-2">Tiempo de Prep</div>
            <div class="text-3xl md:text-4xl font-bold text-light-primary">{{ recipe.prepTime }}<span class="text-lg">m</span></div>
          </div>

          <!-- Tiempo de cocción -->
          <div class="bg-white rounded-lg shadow-md p-4 md:p-6 border-t-4 border-light-secondary">
            <div class="text-light-primary/60 text-xs font-bold uppercase tracking-wider mb-2">Tiempo de Cocción</div>
            <div class="text-3xl md:text-4xl font-bold text-light-secondary">{{ recipe.cookTime }}<span class="text-lg">m</span></div>
          </div>

          <!-- Porciones -->
          <div class="bg-white rounded-lg shadow-md p-4 md:p-6 border-t-4 border-light-accent">
            <div class="text-light-primary/60 text-xs font-bold uppercase tracking-wider mb-2">Porciones</div>
            <div class="text-3xl md:text-4xl font-bold text-light-accent">{{ recipe.servings }}</div>
          </div>
        </div>

        <!-- SECCIÓN CONTENIDO: Ingredientes arriba, Instrucciones abajo (móvil) / Lado a lado (desktop) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <!-- Ingredientes -->
          <div>
            <h2 class="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-light-primary pb-4 border-b-2 border-light-accent">Ingredientes</h2>
            <ul class="space-y-4">
              <li v-for="(ingredient, index) in recipe.ingredients" :key="index" class="flex items-start gap-4 group">
                <input type="checkbox" class="mt-1 cursor-pointer flex-shrink-0 w-5 h-5 accent-light-accent" />
                <div class="flex-1">
                  <p class="text-sm md:text-base font-medium text-light-primary group-hover:text-light-accent transition">
                    {{ ingredient.ingredient?.name || ingredient.name }}
                  </p>
                  <p class="text-xs md:text-sm text-light-primary/60">
                    {{ ingredient.quantity }} {{ ingredient.measurement }}
                  </p>
                  <span v-if="ingredient.notes" class="text-xs text-light-primary/40 block mt-1 italic">({{ ingredient.notes }})</span>
                </div>
              </li>
            </ul>
          </div>

          <!-- Instrucciones -->
          <div>
            <h2 class="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-light-primary pb-4 border-b-2 border-light-accent">Instrucciones</h2>
            <ol class="space-y-6">
              <li v-for="(instruction, index) in recipe.instructions" :key="index" class="flex gap-4">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-8 w-8 rounded-full bg-light-primary text-white font-bold text-sm">
                    {{ instruction.stepNumber }}
                  </div>
                </div>
                <div class="flex-1 flex flex-col md:flex-row justify-between items-start pt-1 gap-2">
                  <div class="flex-1">
                    <p class="text-sm md:text-base text-light-primary leading-relaxed">{{ instruction.instruction }}</p>
                  </div>
                  <div v-if="instruction.timerMinutes" class="flex-shrink-0">
                    <span class="text-light-accent font-bold text-xs md:text-sm bg-light-accent/10 px-3 py-1 rounded-full whitespace-nowrap">
                      ⏱ {{ instruction.timerMinutes }}m
                    </span>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>