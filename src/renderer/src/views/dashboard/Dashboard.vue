<script setup lang="ts">
import Drag from '@renderer/components/drag/Drag.vue'

const cards = [
  'now',
  'weather',
  'wakatime',
  'taptap',
  'v2ex',
]
const data = reactive({
  showCards: cards as string[],
})
const { showCards } = toRefs(data)
</script>

<template>
  <div>
    <div class="w-full h-full relative">
      <drag v-if="showCards.includes('v2ex')" name="v2ex">
        <V2exCard />
      </drag>
      <drag v-if="showCards.includes('taptap')" name="taptap">
        <TapTapCard />
      </drag>
      <drag v-if="showCards.includes('wakatime')" name="wakatime">
        <WakaTimeCard />
      </drag>
      <drag v-if="showCards.includes('weather')" name="weather">
        <WeatherCard />
      </drag>
      <drag v-if="showCards.includes('now')" name="now">
        <NowCard class="w-full font-bold text-[14px]" />
      </drag>
    </div>
  </div>
</template>

<style lang="less">
.setting-action {
  border-radius: 4px 0 0 4px;
}
.vue-resizable-handle {
  visibility: hidden;
}
.vue-grid-item:hover > .vue-resizable-handle {
  visibility: visible;
}
</style>
