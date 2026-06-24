<template>
    <div class="min-h-screen bg-light-bg flex items-center justify-center px-4">
        <div class="text-center max-w-md mx-auto">
            
            <div class="text-8xl mb-8">
                🍳
            </div>
            
            
            <h1 class="text-6xl font-heading font-bold text-light-primary mb-4">
                404
            </h1>
            

            <h2 class="text-2xl font-heading font-semibold text-light-secondary mb-4">
                ¡Receta no encontrada!
            </h2>
            
            <p class="text-lg text-light-text mb-8">
                Parece que esta receta se quemó en el horno. 
                Volvamos a la cocina para encontrar algo delicioso.
            </p>
            
            
            <div class="space-y-4">
                <router-link 
                    to="/" 
                    class="block w-full bg-light-accent text-white py-3 px-6 rounded-lg 
                           font-medium hover:bg-light-accent/90 transition-colors"
                >
                    Volver al Inicio
                </router-link>                
            </div>
        </div>
    </div>
</template>