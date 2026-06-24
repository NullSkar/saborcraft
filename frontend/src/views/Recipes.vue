<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { recipeService } from '../services/api.js'
import SearchBar from '../components/SearchBar.vue'
import RecipeCard from '../components/RecipeCard.vue'

const route = useRoute()
const router = useRouter()
const recipes = ref([])
const loading = ref(false)
const error = ref(null)

// Filtros
const selectedCategories = ref([])
const selectedDifficulties = ref([])
const selectedRatingMin = ref(0)
const allCategories = ref([])
const sortBy = ref('newest')

// Constantes para opciones
const difficultyOptions = [
  { value: 'facil', label: 'Fácil' },
  { value: 'medio', label: 'Medio' },
  { value: 'dificil', label: 'Difícil' }
]

const ratingOptions = [
  { value: 0, label: 'Todas las puntuaciones' },
  { value: 1, label: '⭐ 1 o más' },
  { value: 2, label: '⭐ 2 o más' },
  { value: 3, label: '⭐ 3 o más' },
  { value: 4, label: '⭐ 4 o más' },
  { value: 5, label: '⭐ 5 estrellas' }
]

const sortOptions = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguas' },
  { value: 'rating', label: 'Mayor puntuación' },
  { value: 'views', label: 'Más vistas' }
]

// Extraer categorías únicas de las recetas
function loadCategories() {
  try {
    const categoriesMap = new Map()
    recipes.value.forEach(recipe => {
      if (recipe.category) {
        const categoryId = recipe.category.id || recipe.category
        const categoryName = recipe.category.name || recipe.category
        if (!categoriesMap.has(categoryId)) {
          categoriesMap.set(categoryId, categoryName)
        }
      }
    })
    allCategories.value = Array.from(categoriesMap).map(([id, name]) => ({
      id: id,
      name: name,
      value: id
    })).sort((a, b) => a.name.localeCompare(b.name))
  } catch (e) {
    console.error('Error procesando categorías:', e)
  }
}

async function loadRecipes(term = route.query.buscar || '') {
  loading.value = true
  error.value = null  
  try {
    if (term) {
      const result = await recipeService.search(term)
      recipes.value = result || []
    } else {
      const result = await recipeService.getAll()
      recipes.value = result || []
    }
    // Cargar categorías después de obtener las recetas
    loadCategories()
  } catch (e) {
    error.value = 'No se pudieron cargar las recetas.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Recetas filtradas y ordenadas
const filteredAndSortedRecipes = computed(() => {
  let filtered = recipes.value

  // Filtrar por categorías
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(r => {
      const categoryId = r.category?.id || r.category
      const categoryName = r.category?.name || r.category
      return selectedCategories.value.includes(categoryId) || selectedCategories.value.includes(categoryName)
    })
  }

  // Filtrar por dificultad
  if (selectedDifficulties.value.length > 0) {
    filtered = filtered.filter(r => selectedDifficulties.value.includes(r.difficulty))
  }

  // Filtrar por rating mínimo
  if (selectedRatingMin.value > 0) {
    filtered = filtered.filter(r => (Number(r.averageRating) || 0) >= selectedRatingMin.value)
  }

  // Ordenar
  switch (sortBy.value) {
    case 'oldest':
      filtered = [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
    case 'rating':
      filtered = [...filtered].sort((a, b) => (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0))
      break
    case 'views':
      filtered = [...filtered].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
      break
    case 'newest':
    default:
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
  }

  return filtered
})

function onResults(found) {
  recipes.value = found || []
  router.push({ path: router.currentRoute.value.path, query: { buscar: queryTrimmed() } })
}

function queryTrimmed() {
  return route.query.buscar ? String(route.query.buscar).trim() : ''
}

function goToRecipe(recipe) {
  if (!recipe?.id) {
    console.error('Error: recipe sin id', recipe)
    return
  }
  router.push({ name: 'RecipeDetails', params: { id: recipe.id } })
}

function resetFilters() {
  selectedCategories.value = []
  selectedDifficulties.value = []
  selectedRatingMin.value = 0
  sortBy.value = 'newest'
}

onMounted(() => {
  loadRecipes()
})

// Solo escuchar cambios en búsqueda
watch(
  () => route.query.buscar,
  (newTerm) => {
    if (newTerm !== undefined) {
      loadRecipes(newTerm)
    }
  }
)
</script>
<template>
  <div class="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
    <!-- Encabezado con búsqueda -->
    <div class="space-y-3 md:space-y-4">
      <h1 class="text-2xl md:text-4xl font-bold text-gray-900">Recetas</h1>
      <SearchBar @results="onResults" />
    </div>

    <!-- Barra de ordenamiento y resultados -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div class="w-full sm:w-auto">
        <label class="text-xs md:text-sm text-gray-600">Ordenar por:</label>
        <select 
          v-model="sortBy"
          class="w-full sm:w-48 mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-light-primary"
        >
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <div class="text-right">
        <h2 class="text-xl md:text-2xl font-bold text-light-primary">
          {{ filteredAndSortedRecipes.length }} resultados
        </h2>
      </div>
    </div>

    <!-- Estados de carga -->
    <div v-if="loading" class="text-center py-12 md:py-16">
      <p class="text-sm md:text-base text-gray-600">Cargando recetas…</p>
    </div>
    <div v-else-if="error" class="text-center text-red-600 py-12 md:py-16">
      <p class="text-sm md:text-base">{{ error }}</p>
    </div>
    
    <!-- Main content: 2 columnas en desktop, stacked en móvil -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
      <!-- FILTROS (Izquierda) -->
      <aside class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-md p-4 md:p-6 lg:sticky lg:top-20">
          <h3 class="text-base md:text-lg font-bold text-gray-900 mb-4">Filtros</h3>

          <!-- Categorías -->
          <div class="mb-4 md:mb-6">
            <h4 class="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Categorías</h4>
            <div v-if="allCategories.length > 0" class="space-y-2">
              <label v-for="category in allCategories" :key="category.value" class="flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  :value="category.value"
                  v-model="selectedCategories"
                  class="w-4 h-4 text-light-primary border-gray-300 rounded focus:ring-light-primary"
                />
                <span class="ml-3 text-gray-700 text-sm md:text-base">{{ category.name }}</span>
              </label>
            </div>
            <div v-else class="text-xs md:text-sm text-gray-500">
              No hay categorías disponibles
            </div>
          </div>

          <!-- Separador -->
          <div class="border-t border-gray-200 my-4 md:my-6"></div>

          <!-- Dificultad -->
          <div class="mb-4 md:mb-6">
            <h4 class="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Dificultad</h4>
            <div class="space-y-2">
              <label v-for="difficulty in difficultyOptions" :key="difficulty.value" class="flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  :value="difficulty.value"
                  v-model="selectedDifficulties"
                  class="w-4 h-4 text-light-primary border-gray-300 rounded focus:ring-light-primary"
                />
                <span class="ml-3 text-gray-700 text-sm md:text-base">{{ difficulty.label }}</span>
              </label>
            </div>
          </div>

          <!-- Separador -->
          <div class="border-t border-gray-200 my-4 md:my-6"></div>

          <!-- Rating Mínimo -->
          <div class="mb-4 md:mb-6">
            <h4 class="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Puntuación</h4>
            <div class="space-y-2">
              <label v-for="rating in ratingOptions" :key="rating.value" class="flex items-center cursor-pointer">
                <input 
                  type="radio"
                  :value="rating.value"
                  v-model.number="selectedRatingMin"
                  class="w-4 h-4 text-light-primary border-gray-300 focus:ring-light-primary"
                />
                <span class="ml-3 text-gray-700 text-sm md:text-base">{{ rating.label }}</span>
              </label>
            </div>
          </div>

          <!-- Separador -->
          <div class="border-t border-gray-200 my-4 md:my-6"></div>

          <!-- Botones de acción -->
          <div class="space-y-2 md:space-y-3">
            <button
              @click="resetFilters"
              class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm md:text-base"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </aside>

      <!-- RECETAS (Derecha) -->
      <main class="lg:col-span-3">
        <div v-if="filteredAndSortedRecipes.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <RecipeCard
            v-for="r in filteredAndSortedRecipes"
            :key="r.id"
            :recipe="r"
            @click-card="goToRecipe"
          />
        </div>

        <!-- Sin resultados -->
        <div v-else class="text-center py-12 md:py-16 text-neutral-600">
          <p class="text-sm md:text-base">No se encontraron recetas.</p>
        </div>
      </main>
    </div>
  </div>
</template>

