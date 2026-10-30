<script setup>
defineProps({ name: { type: String, default: 'gift' } })
</script>

<template>
  <svg viewBox="0 0 100 90" fill="none" stroke="#193e72" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <g v-if="name === 'perfume'">
      <rect x="29" y="31" width="43" height="48" rx="9" fill="#b6dcff" /><path d="M41 18h19v13H41z" fill="#ee3651" />
      <rect x="36" y="11" width="29" height="10" rx="3" fill="#f7eee0" /><path d="M40 47h21v20H40z" fill="#f9fcff" /><path d="m49 51-5 7h6l-2 5 10-9h-7l3-5" stroke="#ed3651" stroke-width="1.5" /><path d="M23 17h-5m2-3v6m58 9h5m-2-3v6" />
    </g>
    <g v-else-if="name === 'shoe'">
      <path d="M17 41q4-4 13 5l10-15 19 10 7 16 19 6q7 4 1 13H16q-9-3-7-12Z" fill="#f9f5e9" />
      <path d="m40 31 19 10 7 16-20-4-13-11M14 58l16 6v6H11" fill="#ec3753" /><path d="M9 70h79m-45-29 10 4m-12 2 13 5m-10 0 13 5" /><path d="m70 33 4-6m4 13 7-1" stroke="#ee3651" />
    </g>
    <g v-else-if="name === 'pants'">
      <path d="M28 13h45l4 65H55l-6-35-5 35H22z" fill="#91bdf1" /><path d="M27 23h47M49 14v18m-21-8q13 13 14 1m18 0q1 12 14 0M23 70h22m10 0h22" /><circle cx="50" cy="19" r="1" fill="#193e72" />
    </g>
    <g v-else-if="name === 'outfit'">
      <path d="m27 15 13-5q10 11 20 0l14 5 15 19-15 11-7-9v23H33V36l-7 9L11 34Z" fill="#f36b78" /><path d="M33 52h34M41 12q9 18 18 0" /><path d="M34 59h32l5 24H54l-4-14-4 14H29z" fill="#9cc5f7" /><path d="m48 27-5 10h7l-2 9 12-14h-8l3-5" fill="#fff4cc" stroke-width="1.5" />
    </g>
    <g v-else-if="name === 'jacket'">
      <path d="M35 19q14-20 30 0l13 8 12 39-15 5-8-22v31H33V49l-9 22-15-5 13-39Z" fill="#8bbaf2" /><path d="M35 19q15 24 30 0M50 32v48M33 61l10 5m24-5-10 5" /><path d="m35 19-4 15 12 2 7-4-5-13m20 0 4 15-12 2-7-4 5-13" fill="#d8eaff" />
    </g>
    <g v-else-if="name === 'spider'">
      <path d="m39 40-16-8-5-15m20 32-23 4-7-8m32 15-21 9-7 13m31-16-6 17m24-43 16-8 5-15M62 49l23 4 7-8M60 60l21 9 7 13M57 66l6 17" stroke="#ed3651" stroke-width="5" />
      <ellipse cx="50" cy="54" rx="16" ry="22" fill="#ee3651" /><circle cx="50" cy="29" r="12" fill="#ee3651" /><path d="M50 32v44M35 49q14 12 30 0M36 60q14 12 28 0m-24-23 20 32m0-32L40 69" stroke-width="1.5" /><path d="m42 25 6 3-3 6m13-9-6 3 3 6" stroke="#fff" />
    </g>
    <g v-else-if="name === 'blocks'">
      <path d="M12 46h36v34H12z" fill="#9ac6f7" /><path d="M52 46h36v34H52z" fill="#ed6578" /><path d="M32 12h36v34H32z" fill="#ffdf88" /><circle cx="30" cy="63" r="8" stroke="#fff" stroke-width="3" /><path d="m61 70 9-15 9 15Z" stroke="#fff" /><path d="M43 22h14v14H43z" stroke="#a78134" />
    </g>
    <g v-else-if="name === 'rocket'">
      <path d="M37 43 21 55l-4 23 24-9m16-26 16 12 4 23-24-9" fill="#98c6ff" /><path d="M36 64Q28 34 49 9q24 25 15 55Z" fill="#f9f7f0" /><path d="M37 28 49 9l14 19" fill="#ec3652" /><circle cx="50" cy="43" r="9" fill="#8cbcff" /><path d="m39 67 11 17 11-17" fill="#ffce6e" /><path d="m45 67 5 10 5-10" fill="#ee3651" />
    </g>
    <g v-else>
      <path d="M18 33h64v15H18zM23 48h54v33H23z" fill="#a7cefc" /><path d="M43 33h14v48H43z" fill="#ee3651" /><path d="M50 33C10 34 21 4 39 17Zm0 0C90 34 79 4 61 17Z" fill="#ee3651" />
    </g>
  </svg>
</template>
