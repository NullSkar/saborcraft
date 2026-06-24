<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/api'

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')
const error = ref('')
const loading = ref(false)

const router = useRouter()

const handleRegister = async () => {
  error.value = ''
  
  // Validaciones
  if (!username.value || !email.value || !password.value) {
    error.value = 'Todos los campos son requeridos'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  loading.value = true
  
  try {
    const response = await authService.register(
      username.value,
      email.value,
      password.value,
      firstName.value,
      lastName.value
    )
    
    if (response.success) {
      router.push('/login')
    } else {
      error.value = response.message || 'Error en el registro'
    }
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Error al conectarse al servidor'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-8 md:py-0">
    <div class="w-full max-w-md bg-white p-6 md:p-8 rounded-lg shadow-md">
      <h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-900">Registro</h2>
      <form @submit.prevent="handleRegister" class="space-y-4 md:space-y-5">
        <div>
          <label for="username" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Nombre de usuario</label>
          <input
            v-model="username"
            type="text"
            id="username"
            class="w-full border border-gray-300 rounded-lg shadow-sm px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
            required
          />
        </div>
        <div>
          <label for="email" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            id="email"
            class="w-full border border-gray-300 rounded-lg shadow-sm px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
            required
          />
        </div>
        <div>
          <label for="firstName" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Nombre (opcional)</label>
          <input
            v-model="firstName"
            type="text"
            id="firstName"
            class="w-full border border-gray-300 rounded-lg shadow-sm px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
          />
        </div>
        <div>
          <label for="lastName" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Apellido (opcional)</label>
          <input
            v-model="lastName"
            type="text"
            id="lastName"
            class="w-full border border-gray-300 rounded-lg shadow-sm px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
          />
        </div>
        <div>
          <label for="password" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Contraseña</label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="w-full border border-gray-300 rounded-lg shadow-sm px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
            required
          />
        </div>
        <div>
          <label for="confirmPassword" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Confirmar contraseña</label>
          <input
            v-model="confirmPassword"
            type="password"
            id="confirmPassword"
            class="w-full border border-gray-300 rounded-lg shadow-sm px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
            required
          />
        </div>
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full mt-6 md:mt-8 py-2.5 md:py-3 px-4 bg-light-primary text-white rounded-lg hover:bg-light-secondary transition font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Registrando...' : 'Registrarse' }}
        </button>
      </form>
      <p class="text-center text-xs md:text-sm text-gray-600 mt-4 md:mt-6">
        ¿Ya tienes una cuenta?
        <router-link to="/login" class="text-light-primary font-semibold hover:text-light-secondary transition">Inicia sesión</router-link>
      </p>
      <div v-if="error" class="mt-4 md:mt-6 p-3 md:p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs md:text-sm">{{ error }}</div>
    </div>
  </div>
</template>
