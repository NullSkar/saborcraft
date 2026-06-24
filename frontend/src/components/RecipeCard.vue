<script setup>
import { defineProps, defineEmits, ref, onMounted } from 'vue'
import { authService, favoriteService } from '../services/api'

const props = defineProps({
    recipe: {
        type: Object,
        required: true,
        default: () => ({})
    }
})

const emit = defineEmits(['click-card'])
const isFavorite = ref(false)
const isLoadingFavorite = ref(false)

// Log para debug
console.log('RecipeCard recipe:', props.recipe)

const handleClick = () => {
    emit('click-card', props.recipe)
}

const toggleFavorite = async (e) => {
    e.stopPropagation()
    
    if (!authService.isLoggedIn()) {
        alert('Debes iniciar sesión para agregar favoritos')
        return
    }

    try {
        isLoadingFavorite.value = true
        if (isFavorite.value) {
            await favoriteService.removeFavorite(props.recipe.id)
        } else {
            await favoriteService.addFavorite(props.recipe.id)
        }
        isFavorite.value = !isFavorite.value
    } catch (error) {
        console.error('Error toggling favorite:', error)
    } finally {
        isLoadingFavorite.value = false
    }
}

onMounted(async () => {
    if (authService.isLoggedIn()) {
        try {
            isFavorite.value = await favoriteService.isFavorite(props.recipe.id)
        } catch (error) {
            console.error('Error checking favorite:', error)
        }
    }
})
</script>

<template>
    <div 
        @click="handleClick"
        class="card cursor-pointer overflow-hidden"
    >
        <!-- Imagen -->
        <div class="relative h-56 overflow-hidden">
            <img 
                :src="recipe.image" 
                :alt="recipe.title"
                class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            >
            <!-- Badge de categoría -->
            <div 
                v-if="recipe && recipe.category && recipe.category.name"
                class="absolute top-4 right-4 px-4 py-2 rounded-full font-medium text-sm shadow-medium text-white"
                :style="{ backgroundColor: recipe.category.color }"
            >
                {{ recipe.category.name }}
            </div>
            <div v-else class="absolute top-4 right-4 px-4 py-2 rounded-full font-medium text-sm shadow-medium bg-light-secondary text-white">
                Sin categoría
            </div>
            <!-- Botón Favorito -->
            <button
                @click="toggleFavorite"
                :disabled="isLoadingFavorite"
                class="absolute top-4 left-4 p-2 rounded-full transition-all duration-200"
                :class="isFavorite ? 'bg-light-accent text-white' : 'bg-white/80 text-light-accent hover:bg-white'"
                title="Agregar a favoritos"
            >
                <svg class="w-6 h-6" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>
        </div>

        <!-- Contenido -->
        <div class="p-6">
            <!-- Título -->
            <h3 class="text-xl font-bold text-light-primary mb-3 line-clamp-1">
                {{ recipe.title }}
            </h3>

            <!-- Descripción -->
            <p class="text-light-secondary/80 mb-4 line-clamp-2">
                {{ recipe.description }}
            </p>

            <!-- Meta información -->
            <div class="flex items-center justify-between text-sm text-light-secondary/60 mb-4">
                <span class="flex items-center gap-1">
                    ⭐ {{ (Number(recipe.averageRating) || 0).toFixed(1) }}
                </span>
                <span class="flex items-center gap-1">
                    👁️ {{ recipe.viewsCount }}
                </span>
                <span class="flex items-center gap-1">
                    ⏱️ {{ recipe.totalTime }} min
                </span>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between pt-4 border-t border-light-secondary/20">
                <div class="flex items-center gap-3">
                    <!-- Avatar del autor -->
                    <div v-if="recipe.author?.avatar" class="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                        <img :src="recipe.author.avatar" :alt="recipe.author.username" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-light-primary">
                        {{ recipe.author?.username?.charAt(0).toUpperCase() || 'U' }}
                    </div>
                    <div class="recipe-author">
                        <span>{{ recipe.author?.username || 'Desconocido' }}</span>
                    </div>
                </div>
                
                <span 
                    class="text-xs font-semibold px-3 py-1 rounded-full"
                    :class="{
                        'bg-green-100 text-green-700': recipe.difficulty === 'facil',
                        'bg-yellow-100 text-yellow-700': recipe.difficulty === 'medio',
                        'bg-red-100 text-red-700': recipe.difficulty === 'dificil'
                    }"
                >
                    {{ recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1) }}
                </span>
            </div>
        </div>
    </div>
</template>