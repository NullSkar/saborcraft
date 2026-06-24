<template>
  <footer class="bg-light-primary text-white py-8 sm:py-12 md:py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Grid de 3 columnas responsive -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12">
        
        <!-- Columna 1: Logo y Descripción -->
        <div class="flex flex-col text-center sm:text-left">
          <h3 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 font-poppins">SaborCraft</h3>
          <p class="text-white/80 text-xs sm:text-sm leading-relaxed">
            Descubre, cocina y comparte deliciosas recetas de alrededor del mundo. Únete a nuestra comunidad de amantes de la cocina.
          </p>
          <p class="text-white/60 text-xs mt-3 sm:mt-4">
            © 2025 SaborCraft. Todos los derechos reservados.
          </p>
        </div>

        <!-- Columna 2: Enlaces Rápidos -->
        <div class="text-center sm:text-left">
          <h4 class="text-base sm:text-lg font-semibold mb-4 sm:mb-6 font-poppins">Enlaces Rápidos</h4>
          <ul class="space-y-2 sm:space-y-3">
            <li>
              <a 
                href="/" 
                class="text-white/80 hover:text-white hover:bg-light-tertiary px-2 sm:px-3 py-1 sm:py-2 rounded transition inline-block text-xs sm:text-sm"
              >
                Inicio
              </a>
            </li>
            <li>
              <a 
                href="/recipes" 
                class="text-white/80 hover:text-white hover:bg-light-tertiary px-2 sm:px-3 py-1 sm:py-2 rounded transition inline-block text-xs sm:text-sm"
              >
                Recetas
              </a>
            </li>
            <li>
              <a 
                href="/recipes/create" 
                class="text-white/80 hover:text-white hover:bg-light-tertiary px-2 sm:px-3 py-1 sm:py-2 rounded transition inline-block text-xs sm:text-sm"
              >
                Crear Receta
              </a>
            </li>
            <li>
              <a 
                href="/profile" 
                class="text-white/80 hover:text-white hover:bg-light-tertiary px-2 sm:px-3 py-1 sm:py-2 rounded transition inline-block text-xs sm:text-sm"
              >
                Mi Perfil
              </a>
            </li>
          </ul>
        </div>

        <!-- Columna 3: Redes Sociales -->
        <div class="text-center sm:text-left">
          <h4 class="text-base sm:text-lg font-semibold mb-4 sm:mb-6 font-poppins">Síguenos</h4>
          <div class="flex flex-wrap justify-center sm:justify-start gap-2 sm:flex-col sm:space-y-2">
            <a 
              href="#" 
              class="text-white/80 hover:text-white hover:bg-light-tertiary px-2 sm:px-3 py-1 sm:py-2 rounded transition inline-flex items-center text-xs sm:text-sm"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span class="hidden sm:inline">Facebook</span>
            </a>
            <a 
              href="#" 
              class="text-white/80 hover:text-white hover:bg-light-tertiary px-2 sm:px-3 py-1 sm:py-2 rounded transition inline-flex items-center text-xs sm:text-sm"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7a10.6 10.6 0 01-9-5.5z"/>
              </svg>
              <span class="hidden sm:inline">Twitter</span>
            </a>
            <a 
              href="#" 
              class="text-white/80 hover:text-white hover:bg-light-tertiary px-2 sm:px-3 py-1 sm:py-2 rounded transition inline-flex items-center text-xs sm:text-sm"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
              </svg>
              <span class="hidden sm:inline">Instagram</span>
            </a>
            <a 
              href="#" 
              class="text-white/80 hover:text-white hover:bg-light-tertiary px-2 sm:px-3 py-1 sm:py-2 rounded transition inline-flex items-center text-xs sm:text-sm"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span class="hidden sm:inline">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Divisor -->
      <div class="border-t border-white/20 pt-6 sm:pt-8">
        <p class="text-center text-white/60 text-xs sm:text-sm">
          Hecho con ❤️ por amantes de la cocina | SaborCraft 2025
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Opcional: puedes añadir estilos adicionales aquí si es necesario */
</style>
