<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { event } from './config/event'
import { isDemo, isConfigured, listGifts, reserveGift, resetDemo } from './services/gifts'
import AppIcon from './components/AppIcon.vue'
import SpiderWeb from './components/SpiderWeb.vue'
import SpiderArt from './components/SpiderArt.vue'
import GiftArt from './components/GiftArt.vue'
import GiftDialog from './components/GiftDialog.vue'

const gifts = ref([])
const loading = ref(true)
const refreshing = ref(false)
const loadError = ref('')
const filter = ref('all')
const selected = ref(null)
const reserving = ref(false)
const reserveError = ref('')
const toast = ref(null)
const activeSection = ref('convite')
let pendingRefresh = null
let pollTimer, toastTimer, observer
const availableCount = computed(() => gifts.value.filter(g => !g.reserved_at).length)
const reservedCount = computed(() => gifts.value.length - availableCount.value)
const filteredGifts = computed(() => gifts.value.filter(g => filter.value === 'all' || (filter.value === 'available' ? !g.reserved_at : Boolean(g.reserved_at))))
const safeMapsUrl = computed(() => {
  try { const url = new URL(event.mapsUrl); return url.protocol === 'https:' ? url.href : '' } catch { return '' }
})

function refresh() {
  if (pendingRefresh) return pendingRefresh
  refreshing.value = true
  pendingRefresh = (async () => {
    try { gifts.value = await listGifts(); loadError.value = '' }
    catch { loadError.value = isConfigured || isDemo ? 'Não conseguimos atualizar a lista. Confira sua conexão e tente novamente.' : 'A lista de presentes será liberada em breve. Volte aqui mais tarde.' }
    finally { loading.value = false; refreshing.value = false }
  })()
  return pendingRefresh.finally(() => { pendingRefresh = null })
}

function choose(gift) {
  if (gift.reserved_at || loadError.value || reserving.value) return
  reserveError.value = ''
  selected.value = gift
}

function notify(message, kind = 'success') {
  clearTimeout(toastTimer)
  toast.value = { message, kind }
  toastTimer = setTimeout(() => { toast.value = null }, 10000)
}

async function confirm() {
  if (!selected.value || reserving.value) return
  reserving.value = true
  reserveError.value = ''
  const gift = selected.value
  try {
    const result = await reserveGift(gift.id)
    if (pendingRefresh) await pendingRefresh
    if (result === 'reserved' || result === 'already_reserved') {
      gifts.value = gifts.value.map(g => g.id === gift.id ? { ...g, reserved_at: new Date().toISOString() } : g)
    }
    selected.value = null
    if (result === 'reserved') notify(isDemo ? 'Escolha de teste salva! Na versão online, ela será compartilhada com todos.' : `Prontinho! ${gift.title} foi reservado. Obrigado pelo carinho!`)
    else if (result === 'already_reserved') notify('Alguém acabou de escolher esse presente. Que tal escolher outro?', 'info')
    else notify('Esse presente saiu da lista. Escolha outra sugestão com carinho.', 'info')
    await refresh()
  } catch {
    reserveError.value = 'Não foi possível confirmar a reserva. Feche esta janela e atualize a lista antes de tentar novamente: a solicitação pode ter chegado ao banco.'
  } finally { reserving.value = false }
}

function onFocus() { if (!document.hidden) refresh() }
function onStorage(e) { if (isDemo && e.key === 'lorenzo-demo-v1') refresh() }
async function clearDemo() { if (reserving.value) return; resetDemo(); await refresh(); notify('A demonstração foi reiniciada.', 'info') }

onMounted(() => {
  document.title = `Aniversário do ${event.name} • Você está convidado!`
  refresh()
  pollTimer = setInterval(() => { if (!document.hidden) refresh() }, 8000)
  window.addEventListener('focus', onFocus)
  document.addEventListener('visibilitychange', onFocus)
  window.addEventListener('storage', onStorage)
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) activeSection.value = entry.target.id
  }, { rootMargin: '-18% 0px -58% 0px' })
  document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section))
})
onBeforeUnmount(() => {
  clearInterval(pollTimer); clearTimeout(toastTimer); observer?.disconnect()
  window.removeEventListener('focus', onFocus)
  document.removeEventListener('visibilitychange', onFocus)
  window.removeEventListener('storage', onStorage)
  document.body.classList.remove('dialog-open')
})
</script>

<template>
  <a class="skip-link" href="#conteudo">Pular para o convite</a>
  <div v-if="isDemo" class="demo-banner"><AppIcon name="info" /><span><strong>Modo demonstração.</strong> As escolhas são de teste, somente neste navegador.</span><button @click="clearDemo">Reiniciar</button></div>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="#convite" :aria-label="`Aniversário do ${event.name}, início`"><span class="brand-symbol"><AppIcon name="gift" /></span><span>{{ event.name }}<small>UM DIA SUPERESPECIAL</small></span></a>
      <nav aria-label="Navegação principal"><a href="#convite" :class="{ active: activeSection === 'convite' }">O convite</a><a href="#presentes" :class="{ active: activeSection === 'presentes' }"><AppIcon name="gift" />Lista de presentes</a></nav>
    </div>
  </header>

  <main id="conteudo">
    <section id="convite" class="hero">
      <SpiderWeb class="web hero-web" />
      <div class="container hero-content">
        <div class="hero-copy">
          <span class="eyebrow"><span class="red-dot"></span>VOCÊ ESTÁ CONVIDADO!</span>
          <h1>{{ event.name }}<span>te convida para uma<br /><em>superfesta!</em></span></h1>
          <p class="hero-description">{{ event.message }}</p>
          <a href="#presentes" class="button button-red hero-cta"><AppIcon name="gift" />Ver lista de presentes<AppIcon name="arrow" /></a>
          <span class="hero-note"><AppIcon name="heart" />O melhor presente é ter você por perto.</span>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div>
          <div class="comic-star star-one">✦</div><div class="comic-star star-two">✧</div>
          <div class="invitation-poster">
            <SpiderWeb class="poster-web" /><span class="poster-eyebrow">PREPARE O SEU SORRISO</span>
            <div class="poster-title">DIA DE<br /><strong>SUPER<span>FESTA!</span></strong></div>
            <div class="spider-hanging-line"></div><SpiderArt class="poster-spider" />
            <div class="poster-stamp">SUA PRESENÇA<br /><b>É ESPECIAL!</b><span>✦</span></div>
            <div class="poster-bottom"><span>DIVERSÃO</span><i>✦</i><span>AVENTURA</span><i>✦</i><span>ALEGRIA</span></div>
          </div>
          <div class="art-caption">Uma missão:<br /><b>comemorar juntos!</b><svg viewBox="0 0 95 50"><path d="M5 6q60 48 81 4m-18 0 19-2-2 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg></div>
        </div>
        <div class="event-details">
          <div class="event-detail"><span class="detail-icon"><AppIcon name="calendar" /></span><div><span>MARQUE NA AGENDA</span><strong>{{ event.date }}</strong></div></div>
          <div class="event-detail"><span class="detail-icon"><AppIcon name="clock" /></span><div><span>A HORA DA DIVERSÃO</span><strong>{{ event.time }}</strong></div></div>
          <div class="event-detail location-detail"><span class="detail-icon"><AppIcon name="pin" /></span><div><span>NOSSO PONTO DE ENCONTRO</span><strong>{{ event.location }}</strong><a v-if="safeMapsUrl" :href="safeMapsUrl" target="_blank" rel="noopener noreferrer">Ver no mapa ↗</a></div></div>
        </div>
      </div>
      <div class="hero-divider" aria-hidden="true"></div>
    </section>

    <section id="presentes" class="gifts-section">
      <div class="container">
        <div class="section-intro"><div><span class="eyebrow"><AppIcon name="gift" />LISTA DE PRESENTES</span><h2>Uma escolha cheia<br />de <em>carinho.</em></h2></div><p>{{ event.giftMessage }}<span>Escolheu e confirmou? O presente fica reservado para você.</span></p></div>
        <div class="how-it-works"><span><i>1</i>Encontre um presente</span><span class="step-arrow">→</span><span><i>2</i>Confirme sua escolha</span><span class="step-arrow">→</span><span><i>3</i>Pronto, ficou reservado!</span><div class="anonymous-note"><AppIcon name="heart" />Sem cadastro, só carinho.</div></div>

        <div class="gifts-toolbar"><div class="filters" role="group" aria-label="Filtrar presentes"><button :class="{ selected: filter === 'all' }" :aria-pressed="filter === 'all'" @click="filter = 'all'">Todos<span>{{ gifts.length }}</span></button><button :class="{ selected: filter === 'available' }" :aria-pressed="filter === 'available'" @click="filter = 'available'">Disponíveis<span>{{ availableCount }}</span></button><button :class="{ selected: filter === 'reserved' }" :aria-pressed="filter === 'reserved'" @click="filter = 'reserved'">Escolhidos<span>{{ reservedCount }}</span></button></div><button class="refresh-button" aria-label="Atualizar lista de presentes" :disabled="refreshing" @click="refresh"><AppIcon name="refresh" :class="{ spinning: refreshing }" /><span>{{ refreshing ? 'Atualizando…' : 'Atualizar lista' }}</span></button></div>
        <p class="sync-note" aria-live="polite"><span :class="['status-dot', { warning: Boolean(loadError) }]"></span>{{ loadError ? 'Aguardando atualização da lista' : isDemo ? 'Prévia para testar o visual e as escolhas' : 'A lista é atualizada automaticamente' }}</p>

        <div v-if="loadError" class="load-error" role="alert"><AppIcon name="info" /><div><strong>{{ loadError }}</strong><p v-if="isConfigured || isDemo">Por enquanto, novas escolhas estão pausadas para confirmar a disponibilidade.</p></div><button v-if="isConfigured || isDemo" class="button button-outline" :disabled="refreshing" @click="refresh">Tentar novamente</button></div>

        <div v-if="loading" class="gift-grid" aria-busy="true" aria-label="Carregando presentes"><div v-for="n in 6" :key="n" class="gift-skeleton"><div></div><span></span><span></span></div></div>
        <div v-else-if="filteredGifts.length" class="gift-grid">
          <article v-for="gift in filteredGifts" :key="gift.id" :class="['gift-card', { reserved: Boolean(gift.reserved_at) }]">
            <div class="gift-card-top"><div :class="['gift-art', `gift-art-${gift.icon}`]"><GiftArt :name="gift.icon" /></div><span :class="['gift-status', { taken: Boolean(gift.reserved_at) }]"><AppIcon v-if="gift.reserved_at" name="check" /><span v-else class="available-dot"></span>{{ gift.reserved_at ? 'Já escolhido' : 'Disponível' }}</span></div>
            <span class="gift-category">{{ gift.category }}</span><h3>{{ gift.title }}</h3><p>{{ gift.description }}</p>
            <button :disabled="Boolean(gift.reserved_at) || Boolean(loadError) || reserving" :aria-label="`${gift.reserved_at ? 'Já escolhido' : 'Escolher'}: ${gift.title}, ${gift.description}`" class="gift-button" @click="choose(gift)"><AppIcon v-if="gift.reserved_at" name="check" />{{ gift.reserved_at ? 'Esse já tem um herói' : 'Escolher este presente' }}<AppIcon v-if="!gift.reserved_at" name="arrow" /></button>
          </article>
        </div>
        <div v-else-if="!loadError" class="empty-state"><AppIcon :name="filter === 'reserved' ? 'gift' : 'heart'" /><h3>{{ filter === 'reserved' ? 'Os mimos ainda estão esperando!' : filter === 'available' && gifts.length ? 'Todos os presentes foram escolhidos!' : 'Novas sugestões em breve!' }}</h3><p>{{ filter === 'reserved' ? 'Assim que alguém confirmar uma escolha, ela aparecerá aqui.' : 'Sua presença continua sendo o nosso melhor presente.' }}</p><button v-if="filter !== 'all'" class="button button-outline" @click="filter = 'all'">Ver todos os presentes</button></div>

        <p class="gift-footnote"><AppIcon name="info" />Os itens marcados como “Já escolhido” não podem ser selecionados novamente.</p>
      </div>
    </section>
  </main>

  <footer class="site-footer"><SpiderWeb class="footer-web" /><div class="container"><span class="eyebrow">A AVENTURA FICA MELHOR COM VOCÊ</span><h2>Te espero na minha <em>superfesta!</em></h2><p>{{ event.signature }}<AppIcon name="heart" /></p><div class="footer-bottom"><span>{{ event.name }} · Um dia para guardar no coração</span><a href="#convite">Voltar ao convite ↑</a></div></div></footer>
  <GiftDialog :gift="selected" :busy="reserving" :error="reserveError" :demo="isDemo" @close="selected = null" @confirm="confirm" />
  <Transition name="toast"><div v-if="toast" :class="['toast-message', toast.kind]" role="status" aria-live="polite"><span class="toast-icon"><AppIcon :name="toast.kind === 'success' ? 'check' : 'info'" /></span><p>{{ toast.message }}</p><button class="icon-button" aria-label="Fechar aviso" @click="toast = null"><AppIcon name="close" /></button></div></Transition>
</template>
