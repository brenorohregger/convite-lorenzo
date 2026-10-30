<script setup>
import { ref, watch, nextTick } from 'vue'
import AppIcon from './AppIcon.vue'
import GiftArt from './GiftArt.vue'

const props = defineProps({ gift: { type: Object, default: null }, busy: Boolean, error: { type: String, default: '' }, demo: Boolean })
const emit = defineEmits(['close', 'confirm'])
const dialog = ref(null)
watch(() => props.gift, async gift => {
  await nextTick()
  if (gift && !dialog.value.open) dialog.value.showModal()
  else if (!gift && dialog.value.open) dialog.value.close()
  document.body.classList.toggle('dialog-open', Boolean(gift))
})
function cancel(e) {
  e.preventDefault()
  if (!props.busy) emit('close')
}
</script>

<template>
  <dialog ref="dialog" class="gift-dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description" @cancel="cancel" @click="e => { if (e.target === dialog && !busy) emit('close') }">
    <template v-if="gift">
      <button class="dialog-close icon-button" aria-label="Fechar janela" :disabled="busy" @click="emit('close')"><AppIcon name="close" /></button>
      <div class="dialog-art"><GiftArt :name="gift.icon" /></div>
      <span class="eyebrow">UM MIMO, MUITO CARINHO</span>
      <h2 id="dialog-title">É esse o presente?</h2>
      <div class="dialog-gift"><strong>{{ gift.title }}</strong><span>{{ gift.description }}</span></div>
      <p id="dialog-description">Ao confirmar, esse presente ficará marcado como escolhido e não poderá ser reservado por outra pessoa.</p>
      <p v-if="demo" class="dialog-demo">Esta é uma demonstração. A escolha só será salva neste navegador.</p>
      <p v-if="error" class="dialog-error" role="alert">{{ error }}</p>
      <button class="button button-red dialog-confirm" :disabled="busy" @click="emit('confirm')"><span v-if="busy" class="spinner"></span><AppIcon v-else name="check" />{{ busy ? 'Confirmando…' : 'Confirmar escolha' }}</button>
      <button class="button button-plain" :disabled="busy" autofocus @click="emit('close')">Quero olhar mais um pouquinho</button>
    </template>
  </dialog>
</template>
