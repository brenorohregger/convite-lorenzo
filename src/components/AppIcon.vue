<script setup>
defineProps({ name: { type: String, default: 'gift' } })
const paths = {
  arrow: ['M5 12h14', 'm13 6 6 6-6 6'],
  down: ['M12 4v16', 'm6 14 6 6 6-6'],
  gift: ['M3 8h18v4H3z', 'M5 12v9h14v-9', 'M12 8v13', 'M12 8H7.5A2.5 2.5 0 1 1 10 5.5L12 8Zm0 0h4.5A2.5 2.5 0 1 0 14 5.5L12 8Z'],
  calendar: ['M4 5h16v16H4z', 'M8 3v4m8-4v4M4 10h16', 'M8 14h2m4 0h2m-8 3h2'],
  clock: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', 'M12 7v5l3 2'],
  pin: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z', 'M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
  check: ['m5 12 4 4L19 6'],
  close: ['m6 6 12 12M6 18 18 6'],
  refresh: ['M20 7v5h-5', 'M4 17v-5h5', 'M6 6a8 8 0 0 1 13 2m-1 10A8 8 0 0 1 5 16'],
  heart: ['M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z'],
  info: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', 'M12 11v6m0-10h.01'],
}
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-for="(path, index) in (paths[name] || paths.gift)" :key="index" :d="path" />
  </svg>
</template>
