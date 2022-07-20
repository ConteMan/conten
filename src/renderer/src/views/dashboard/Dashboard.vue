<script setup lang="ts">
import Drag from '@renderer/components/drag/Drag.vue'
import ActivityCard from '@renderer/components/activity/ActivityCard.vue'
import OneCard from '@renderer/components/one/OneCard.vue'

const cards = [
  'now',
  'weather',
  'wakatime',
  'taptap',
  'v2ex',
  'activity',
  'one',
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
      <drag v-if="showCards.includes('activity')" name="activity">
        <ActivityCard />
      </drag>
      <drag v-if="showCards.includes('one')" name="one">
        <OneCard />
      </drag>
    </div>
  </div>
</template>

<style lang="less">

</style>
