<script setup lang="ts">
import dayjs from 'dayjs'
import { useRefreshState } from '@renderer/store/refresh'
import { invokeApi } from '@renderer/utils/ipcMessage'

const data = reactive({
  module: 'weather',
  enable: true,
  weatherData: null as any,
  weatherExpired: null as any,
  weatherUpdatedAt: null as any,
  todayText: '',
  showDayWeather: false,
})
const { module, enable, weatherData, showDayWeather, weatherUpdatedAt, todayText } = toRefs(data)

const moduleEnable = async () => {
  const res = await invokeApi({
    name: 'module-enable',
    data: {
      module: module.value,
    },
  })
  data.enable = res
  return res
}

const getTodayText = (days: any[]) => {
  const todayDate = dayjs().format('YYYY/MM/DD')
  const today = days.find((day: any) => day.date === todayDate)
  return today ? `${today.dayText} / ${today.nightText}` : ''
}

const windDirection = computed(() => {
  return !['9999'].includes(weatherData.value.now.windDirection) ? weatherData.value.now.windDirection : ''
})

const changeShowDayWeather = () => {
  data.showDayWeather = !data.showDayWeather
}

const getWeather = async (refresh = false) => {
  const weatherRes = await invokeApi({
    name: 'get-weather',
    data: {
      refresh,
    },
  })
  data.weatherData = weatherRes?.data
  data.weatherExpired = weatherRes?.expired
  data.weatherUpdatedAt = weatherRes?.updated_at
  data.todayText = getTodayText(weatherRes?.data.daily)
}

const init = async () => {
  const enable = await moduleEnable()
  if (enable)
    await getWeather()
}
init()

const refreshState = useRefreshState()
watch(() => refreshState.weather, (val) => {
  if (val) {
    init()
    refreshState.toggle('weather', false)
  }
})
</script>

<template>
  <div
    v-if="enable && weatherData"
    class="weather-card p-2"
  >
    <div>
      <span
        class="font-bold cursor-pointer select-none"
        @click="changeShowDayWeather()"
      >
        {{ weatherData.location.name }}
      </span>
      <span v-if="todayText" class="ml-1 text-xs">{{ todayText }}</span>
      <span
        class="weather-data-time ml-2 text-xs text-gray-400 italic cursor-pointer invisible"
        @click="getWeather(true)"
      >
        {{ dayjs(weatherUpdatedAt).format('HH:mm') }}
      </span>
    </div>
    <div>
      <span>{{ weatherData.now.temperature }} ℃</span>
      <span class="ml-1">/</span>
      <span class="ml-1">湿度 {{ weatherData.now.humidity }}%</span>
      <span v-if="weatherData.now.windScale || windDirection" class="ml-1">/</span>
      <span v-if="windDirection" class="ml-1">{{ windDirection }}</span>
      <span v-if="weatherData.now.windScale" class="ml-1">{{ `${weatherData.now.windScale ?? ''}` }}</span>
    </div>
    <div v-if="weatherData.alarm.length">
      <div v-for="alarm in weatherData.alarm" :key="alarm.id">
        {{ `${alarm.signaltype}${alarm.signallevel}预警` }}
      </div>
    </div>
    <div v-if="showDayWeather">
      <span class="text-xs text-gray-400 italic">Updated at {{ weatherData.lastUpdate }}</span>
    </div>
    <div v-if="showDayWeather" class="mt-1 flex flex-wrap gap-4">
      <div v-for="day in weatherData.daily" :key="day.date">
        <p>{{ day.date }}</p>
        <div>{{ day.low }} / {{ day.high }}</div>
        <div>{{ day.dayText }} / {{ day.nightText }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.weather-card:hover {
  .weather-data-time {
    visibility: visible;
  }
}
</style>
