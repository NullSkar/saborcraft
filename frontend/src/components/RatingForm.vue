<script setup>
import { ref, computed, onMounted } from 'vue'
import { authService, ratingService } from '../services/api'

const props = defineProps({
  recipeId: {
    type: Number,
    required: true
  },
  averageRating: {
    type: Number,
    default: 0
  },
  ratingsCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['rating-updated'])

const isLoggedIn = ref(false)
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const userRating = ref(null)
const userRatingId = ref(null)
const currentUser = ref(null)
const hoverRating = ref(0)
const selectedRating = ref(0)

onMounted(async () => {
  isLoggedIn.value = authService.isLoggedIn()
  if (isLoggedIn.value) {
    try {
      currentUser.value = await authService.getCurrentUser()
      // Cargar ratings de la receta para ver si el usuario ya calificó
      const ratings = await ratingService.getByRecipe(props.recipeId)
      const userRatingObj = ratings.find(r => r.userId === (currentUser.value.id || currentUser.value.data?.id))
      if (userRatingObj) {
        userRating.value = userRatingObj.rating
        userRatingId.value = userRatingObj.id
        selectedRating.value = userRatingObj.rating
      }
    } catch (err) {
      console.error('Error cargando ratings:', err)
    }
  }
})

const submitRating = async (rating) => {
  if (!isLoggedIn.value) {
    error.value = 'Debes iniciar sesión para calificar'
    return
  }

  error.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    selectedRating.value = rating

    if (userRatingId.value) {
      // Actualizar rating existente
      await ratingService.update(userRatingId.value, rating)
      successMessage.value = 'Calificación actualizada'
    } else {
      // Crear nuevo rating
      const response = await ratingService.create(props.recipeId, rating)
      userRatingId.value = response.data.id
      successMessage.value = 'Gracias por calificar'
    }

    userRating.value = rating
    emit('rating-updated')

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al calificar'
  } finally {
    isLoading.value = false
  }
}

const deleteRating = async () => {
  if (!userRatingId.value || !isLoggedIn.value) return

  error.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    await ratingService.delete(userRatingId.value)
    userRating.value = null
    userRatingId.value = null
    selectedRating.value = 0
    successMessage.value = 'Calificación eliminada'
    emit('rating-updated')

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al eliminar calificación'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <!-- Error Message -->
    <div v-if="error" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
      {{ successMessage }}
    </div>

    <!-- Rating Stats -->
    <div class="mb-6">
      <div class="flex items-center gap-4">
        <div>
          <div class="text-3xl font-bold text-gray-900">
            {{ props.averageRating.toFixed(1) }}
          </div>
          <div class="text-sm text-gray-600">
            {{ props.ratingsCount }} {{ props.ratingsCount === 1 ? 'calificación' : 'calificaciones' }}
          </div>
        </div>
        <div class="flex-1">
          <!-- Star rating display -->
          <div class="flex gap-1">
            <span
              v-for="i in 5"
              :key="i"
              class="text-2xl"
              :class="i <= Math.round(props.averageRating) ? 'text-yellow-400' : 'text-gray-300'"
            >
              ★
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- User Rating Form -->
    <div v-if="isLoggedIn" class="border-t pt-6">
      <h3 class="text-sm font-medium text-gray-900 mb-4">
        {{ userRating ? 'Tu calificación' : 'Califica esta receta' }}
      </h3>

      <div class="flex gap-2 mb-4">
        <button
          v-for="i in 5"
          :key="i"
          @click="submitRating(i)"
          @mouseenter="hoverRating = i"
          @mouseleave="hoverRating = 0"
          :disabled="isLoading"
          class="text-3xl transition-all cursor-pointer"
          :class="[
            i <= (hoverRating || selectedRating) ? 'text-yellow-400' : 'text-gray-300',
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
          ]"
        >
          ★
        </button>
      </div>

      <!-- Delete Button -->
      <button
        v-if="userRating"
        @click="deleteRating"
        :disabled="isLoading"
        class="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Eliminar calificación
      </button>
    </div>

    <!-- Login Prompt -->
    <div v-else class="border-t pt-6">
      <p class="text-sm text-gray-600 mb-4">
        Inicia sesión para calificar esta receta
      </p>
      <router-link
        to="/login"
        class="inline-block px-4 py-2 bg-light-primary text-white rounded-lg hover:bg-light-secondary transition"
      >
        Ir a Login
      </router-link>
    </div>
  </div>
</template>
