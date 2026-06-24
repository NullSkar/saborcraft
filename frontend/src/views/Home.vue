<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import RecipeCard from '../components/RecipeCard.vue'
import { recipeService } from '../services/api'
import { useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const recipes = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')

// Obtener las 9 recetas más populares
const topRecipes = computed(() => {
  return recipes.value
    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
    .slice(0, 9)
})

async function loadRecipes(term = route.query.buscar || '') {
  loading.value = true;
  error.value = null;
  try {
    const result = await recipeService.getAll(term ? { search: term } : {});
    recipes.value = Array.isArray(result)
      ? result
      : (result.recipes || result.data?.data || []);
  } catch (err) {
    error.value = 'Error al cargar las recetas.';
    console.error('Error en loadRecipes:', err);
  } finally {
    loading.value = false;
  }
}

const searchRecipes = async () => {
    if (!searchQuery.value.trim()) {
        loadRecipes()
        return
    }
    
    try {
        loading.value = true
        error.value = null
        const response = await recipeService.search(searchQuery.value)
        recipes.value = response.data.data || []
    } catch (err) {
        error.value = 'Error al buscar recetas'
        console.error('Error en búsqueda:', err)
    } finally {
        loading.value = false
    }
}

const goToRecipe = (recipeId) => {
    router.push(`/recipes/${recipeId}`)
}

const goToAllRecipes = () => {
    router.push('/recipes')
}

onMounted(() => {
    loadRecipes()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section 
      class="relative py-32 md:py-48 px-4 md:px-8 overflow-hidden"
      style="background-image: url('https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=600&fit=crop'); background-size: cover; background-position: center;"
    >
      <!-- Blur and Overlay -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>
      
      <!-- Content -->
      <div class="relative z-10 max-w-5xl mx-auto text-center">
        <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
          Descubre sabores con SaborCraft
        </h1>
        <p class="text-lg md:text-xl text-white/95 mb-8 md:mb-10 max-w-3xl mx-auto">
          Explora, cocina, y comparte deliciosas recetas de alrededor del mundo. Únete a nuestra comunidad de amantes de la cocina.
        </p>
        <button
          @click="goToAllRecipes"
          class="inline-block px-8 md:px-10 py-3 md:py-4 bg-light-accent text-white font-semibold rounded-lg hover:bg-light-tertiary transition shadow-lg text-sm md:text-base"
        >
          Empieza a cocinar
        </button>
      </div>
    </section>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-12 md:py-16">

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24">
        <svg class="w-16 h-16 text-light-primary animate-spin mb-6" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        <p class="text-gray-600 text-lg">
          Cargando recetas deliciosas...
        </p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="max-w-md mx-auto mt-16">
        <div class="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h3 class="text-xl font-bold text-red-800 mb-3">Error</h3>
          <p class="text-red-600 mb-6">{{ error }}</p>
          <button
            @click="loadRecipes"
            class="inline-flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
          >
            Reintentar
          </button>
        </div>
      </div>

      <!-- Top 9 Recetas -->
      <section v-else-if="topRecipes.length" class="animate-fadeIn">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4 md:mb-6">
          Recetas más populares
        </h2>
        <p class="text-gray-600 text-center mb-12 md:mb-16 text-sm md:text-base">
          Descubre las recetas favoritas de nuestra comunidad
        </p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div
            v-for="recipe in topRecipes"
            :key="recipe.id"
            @click="goToRecipe(recipe.id)"
            class="cursor-pointer hover:transform hover:scale-105 transition duration-300"
          >
            <recipe-card :recipe="recipe" />
          </div>
        </div>

        <!-- Ver más button -->
        <div class="text-center mt-12 md:mt-16">
          <button
            @click="goToAllRecipes"
            class="inline-block px-8 md:px-10 py-3 md:py-4 bg-light-primary text-white font-semibold rounded-lg hover:bg-light-tertiary transition shadow-lg text-sm md:text-base"
          >
            Ver todas las recetas
          </button>
        </div>
      </section>

      <!-- No Results -->
      <div v-else class="text-center py-24">
        <h3 class="text-2xl font-bold text-gray-700 mb-3">
          No se encontraron recetas
        </h3>
        <p class="text-gray-600 mb-8">
          Por favor, intenta más tarde
        </p>
        <button
          @click="loadRecipes"
          class="inline-flex items-center justify-center px-6 py-2 bg-light-primary text-white rounded-lg shadow-sm hover:bg-light-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-primary transition"
        >
          Reintentar
        </button>
      </div>
    </div>
  </div>
</template>