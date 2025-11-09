<template>
  <nav
    class="bg-white shadow-md px-8 py-4 flex items-center justify-between font-medium"
  >
    <!-- Logo -->
    <div class="text-2xl font-semibold text-gray-800 tracking-tight">MyApp</div>

    <!-- Navigation Links -->
    <div class="flex space-x-8">
      <router-link
        to="/"
        class="text-gray-700 hover:text-blue-600 transition-colors duration-200"
      >
        Home
      </router-link>
      <router-link
        to="/tracking"
        class="text-gray-700 hover:text-blue-600 transition-colors duration-200"
      >
        Tracking
      </router-link>
    </div>
  </nav>

  <main class="p-6">
    <div class="w-full max-w-5xl mx-auto">
      <router-view />
    </div>
  </main>
</template>

<script setup></script>
