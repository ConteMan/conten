<script setup lang="ts">
import DBModule from './modules/DB.vue'
import WakaTimeModule from './modules/WakeTime.vue'

const modules = [
  {
    name: '数据库',
    code: 'db',
  },
  {
    name: 'WakaTime',
    code: 'wakatime',
  },
]
const data = reactive({
  currentModule: 'db',
})
const { currentModule } = toRefs(data)
</script>

<template>
  <div class="h-full w-full flex">
    <div class="h-full w-[120px] pt-[80px] space-y-2">
      <div
        v-for="itemModule in modules"
        :key="itemModule.code"
        class="px-2 cursor-pointer text-left hover:(underline decoration-2 underline-offset-4)"
        :class="{ 'font-bold text-red-600': currentModule === itemModule.code }"
        @click="() => data.currentModule = itemModule.code"
      >
        <span>
          {{ itemModule.name }}
        </span>
      </div>
    </div>

    <div class="h-full w-[calc(100%-120px)] p-4">
      <DBModule v-if="currentModule === 'db'" />
      <WakaTimeModule v-if="currentModule === 'wakatime'" />
    </div>
  </div>
</template>
