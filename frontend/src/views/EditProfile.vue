<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/api'

const router = useRouter()
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const successMessage = ref('')
const currentUser = ref(null)

const form = ref({
  firstName: '',
  lastName: '',
  bio: '',
  avatar: ''
})

const avatarPreview = ref('')

onMounted(async () => {
  if (!authService.isLoggedIn()) {
    router.push('/login')
    return
  }

  try {
    isLoading.value = true
    const response = await authService.getCurrentUser()
    console.log('Response from getCurrentUser:', response)
    
    // authService.getCurrentUser retorna response.data que es { success: true, data: userData }
    // Entonces response aquí es { success: true, data: userData }
    const userData = response.data
    console.log('userData:', userData)
    
    if (userData && userData.id) {
      currentUser.value = userData
      form.value = {
        firstName: userData.first_name || userData.firstName || '',
        lastName: userData.last_name || userData.lastName || '',
        bio: userData.bio || '',
        avatar: userData.avatar || ''
      }
      avatarPreview.value = userData.avatar || ''
      console.log('Form loaded successfully:', form.value)
      console.log('CurrentUser:', currentUser.value)
    } else {
      error.value = 'No se pudieron cargar los datos del usuario'
      console.error('userData is missing or id is missing:', userData)
    }
  } catch (err) {
    console.error('Error cargando usuario:', err)
    error.value = 'Error al cargar los datos del usuario: ' + (err.message || JSON.stringify(err))
  } finally {
    isLoading.value = false
  }
})

const handleAvatarChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    // Validar tamaño del archivo (máximo 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB en bytes
    if (file.size > maxSize) {
      error.value = 'La imagen es muy grande. Máximo 100MB'
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Data = event.target.result
      avatarPreview.value = base64Data
      form.value.avatar = base64Data
      console.log('Avatar loaded as base64, size:', base64Data.length)
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  error.value = ''
  successMessage.value = ''

  // Validar campos
  if (!form.value.firstName.trim()) {
    error.value = 'El nombre es requerido'
    return
  }

  if (!form.value.lastName.trim()) {
    error.value = 'El apellido es requerido'
    return
  }

  isSaving.value = true

  try {
    const updateData = {
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      bio: form.value.bio.trim(),
      avatar: form.value.avatar
    }

    const response = await authService.updateProfile(currentUser.value.id, updateData)

    if (response.success) {
      successMessage.value = 'Perfil actualizado correctamente'
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } else {
      error.value = response.message || 'Error al actualizar el perfil'
    }
  } catch (err) {
    console.error('Error:', err)
    error.value = err.response?.data?.message || 'Error al guardar los cambios'
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  router.push('/profile')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-6 md:py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-6 md:mb-8">
        <h1 class="text-2xl md:text-4xl font-bold text-gray-900">
          Editar Perfil
        </h1>
        <p class="text-xs md:text-base text-gray-600 mt-1 md:mt-2">Actualiza tu información personal</p>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow-md p-4 md:p-8">
        <!-- Error Message -->
        <div v-if="error" class="mb-4 md:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 text-red-700 text-xs md:text-sm">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-4 md:mb-6 bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 text-green-700 text-xs md:text-sm">
          {{ successMessage }}
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12 md:py-16">
          <p class="text-xs md:text-base text-gray-600">Cargando datos...</p>
        </div>

        <!-- Form Content -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-4 md:space-y-6">
          <!-- Avatar Section -->
          <div class="flex flex-col items-center mb-6 md:mb-8">
            <div class="w-24 h-24 md:w-32 md:h-32 rounded-full bg-light-primary flex items-center justify-center text-white text-3xl md:text-5xl font-bold mb-3 md:mb-4 overflow-hidden">
              <img v-if="avatarPreview" :src="avatarPreview" :alt="form.firstName" class="w-full h-full object-cover" />
              <span v-else>{{ form.firstName?.charAt(0).toUpperCase() || 'U' }}</span>
            </div>
            <label class="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                @change="handleAvatarChange"
                class="hidden"
              />
              <span class="px-3 md:px-4 py-2 bg-light-primary text-white rounded-lg hover:bg-light-secondary transition text-xs md:text-sm font-medium">
                Cambiar Avatar
              </span>
            </label>
            <p class="text-xs text-gray-500 mt-2">PNG, JPG o GIF (máx. 100MB)</p>
          </div>

          <!-- First Name -->
          <div>
            <label for="firstName" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Nombre *
            </label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              placeholder="Tu nombre"
              class="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              required
            />
          </div>

          <!-- Last Name -->
          <div>
            <label for="lastName" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Apellido *
            </label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              placeholder="Tu apellido"
              class="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              required
            />
          </div>

          <!-- Bio -->
          <div>
            <label for="bio" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Biografía
            </label>
            <textarea
              id="bio"
              v-model="form.bio"
              placeholder="Cuéntanos sobre ti"
              rows="4"
              class="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ form.bio.length }}/500 caracteres</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6 border-t border-gray-200">
            <button
              type="submit"
              :disabled="isSaving"
              class="flex-1 px-4 md:px-6 py-2 md:py-2.5 bg-light-primary text-white rounded-lg hover:bg-light-secondary transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm md:text-base"
            >
              {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
            <button
              type="button"
              @click="handleCancel"
              :disabled="isSaving"
              class="flex-1 px-4 md:px-6 py-2 md:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm md:text-base"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
