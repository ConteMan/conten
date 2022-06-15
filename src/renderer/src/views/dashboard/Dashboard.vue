<script setup lang="ts">
import _ from 'lodash'

const cards = [
  'now',
  'weather',
  'wakatime',
  'taptap',
  'v2ex',
  'subject',
]
const data = reactive({
  showCards: cards as string[],
  showSetting: false,
})
const { showCards, showSetting } = toRefs(data)

const showDeal = (module: string) => {
  if (data.showCards.includes(module)) {
    _.remove(data.showCards, (item) => {
      return module === item
    })
  }
  else {
    data.showCards.push(module)
  }
  // eslint-disable-next-line no-console
  console.log(data.showCards)
}
</script>

<template>
  <div class="flex flex-row items-start">
    <div class="pl-4 flex-grow gap-2">
      <NowCard v-if="showCards.includes('now')" class="w-full flex-shrink-0" />
      <WeatherCard v-if="showCards.includes('weather')" />
      <WakaTimeCard v-if="showCards.includes('wakatime')" />
      <TapTapCard v-if="showCards.includes('taptap')" />
      <V2exCard v-if="showCards.includes('v2ex')" />
      <SubjectCard v-if="showCards.includes('subject')" />
    </div>
    <div
      class="setting-action flex-shrink-0 w-[10px] h-full flex justify-center items-center cursor-pointer hover:(bg-light-400)"
      @click="() => showSetting = !showSetting"
    >
      <div class="setting-icon h-0 w-0" />
    </div>
    <div v-if="showSetting" class="setting-container bg-light-400 w-[300px] h-full flex-shrink-0 p-4">
      <div
        class="bg-light-800 flex justify-center items-center mb-4 py-1 text-[14px] font-bold hover:(text-red-400) cursor-pointer"
        @click="() => showSetting = !showSetting"
      >
        x
      </div>
      <div class="mb-2">
        模块
      </div>
      <div class="flex flex-col gap-1">
        <div
          class="px-2 bg-blue-200 cursor-pointer"
          :class="{ '!bg-red-400': showCards.includes('now') }"
          @click="showDeal('now')"
        >
          时间
        </div>
        <div
          class="px-2 bg-blue-200 cursor-pointer"
          :class="{ '!bg-red-400': showCards.includes('weather') }"
          @click="showDeal('weather')"
        >
          天气
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.setting-action {
  border-radius: 4px 0 0 4px;
}
</style>
