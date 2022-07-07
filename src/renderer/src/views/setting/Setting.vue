<script setup lang="ts">
import SystemModule from './modules/System.vue'
// import WeatherModule from './modules/Weather.vue'
// import WakaTimeModule from './modules/WakeTime.vue'
// import TapTapModule from './modules/TapTap.vue'
// import V2exModule from './modules/V2ex.vue'
// import DoubanModule from './modules/Douban.vue'
import ShortcutModule from './modules/Shortcut.vue'
import ScheduleModule from './modules/Schedule.vue'
import Module from './modules/Module.vue'

const modules = [
  {
    name: '系统',
    code: 'system',
  },
  {
    name: '定时',
    code: 'schedule',
  },
  {
    name: '模块',
    code: 'module',
  },
  // {
  //   name: '天气',
  //   code: 'weather',
  // },
  // {
  //   name: 'WakaTime',
  //   code: 'wakatime',
  // },
  // {
  //   name: 'TapTap',
  //   code: 'taptap',
  // },
  // {
  //   name: 'V2EX',
  //   code: 'v2ex',
  // },
  // {
  //   name: '豆瓣',
  //   code: 'douban',
  // },
  {
    name: '快捷键',
    code: 'shortcut',
  },
]
const data = reactive({
  currentModule: 'system',
})
const { currentModule } = toRefs(data)
</script>

<template>
  <div class="h-full w-full flex">
    <div class="h-full w-[120px] pt-[80px] space-y-2">
      <div
        v-for="itemModule in modules"
        :key="itemModule.code"
        class="px-4 cursor-pointer text-left hover:(underline decoration-2 underline-offset-4)"
        :class="{ 'font-bold text-red-600': currentModule === itemModule.code }"
        @click="() => data.currentModule = itemModule.code"
      >
        <span>
          {{ itemModule.name }}
        </span>
      </div>
    </div>

    <div class="h-full w-[calc(100%-120px)] p-4 overflow-y-auto">
      <SystemModule v-if="currentModule === 'system'" />
      <ScheduleModule v-if="currentModule === 'schedule'" />
      <Module v-if="currentModule === 'module'" />
      <!-- <WeatherModule v-if="currentModule === 'weather'" />
      <WakaTimeModule v-if="currentModule === 'wakatime'" />
      <TapTapModule v-if="currentModule === 'taptap'" />
      <V2exModule v-if="currentModule === 'v2ex'" />
      <DoubanModule v-if="currentModule === 'douban'" /> -->
      <ShortcutModule v-if="currentModule === 'shortcut'" />
    </div>
  </div>
</template>
