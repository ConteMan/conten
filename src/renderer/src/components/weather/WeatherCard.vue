<script setup lang="ts">
import dayjs from 'dayjs'
import { useRefreshState } from '@renderer/store/refresh'
import { invokeApi } from '@renderer/utils/ipcMessage'

const module = 'weather'

const data = reactive({
  enable: true,
  updatedAt: '',
  weatherData: null as any,
  todayText: '',
  showDayWeather: false,
})
const { enable, weatherData, showDayWeather, updatedAt, todayText } = toRefs(data)

const moduleEnable = async () => {
  const res = await invokeApi({
    name: 'module-enable',
    data: {
      module,
    },
  })
  data.enable = res
  return res
}

const getTodayText = (days: any[]) => {
  const todayDate = dayjs().format('YYYY/MM/DD')
  const today = days.find((day: any) => day.date === todayDate)
  return today ? `${today.dayText} - ${today.nightText}` : ''
}

const windDirection = computed(() => {
  return !['9999'].includes(weatherData.value.now.windDirection) ? weatherData.value.now.windDirection : ''
})

const changeShowDayWeather = () => {
  data.showDayWeather = !data.showDayWeather
}

const getWeather = async (refresh = false) => {
  const res = await invokeApi({
    name: 'get-weather',
    data: {
      refresh,
    },
  })
  data.weatherData = res?.data
  data.updatedAt = res?.updated_at
  data.todayText = getTodayText(res?.data.daily)
}

const init = async () => {
  const enable = await moduleEnable()
  if (enable)
    await getWeather()
}
init()

const refreshState = useRefreshState()
const { weather } = storeToRefs(refreshState)
watch(weather, async () => {
  await init()
})
</script>

<template>
  <div
    v-if="enable && weatherData"
    class="weather-card p-2"
  >
    <div>
      <span
        class="cursor-pointer select-none"
        @click="changeShowDayWeather()"
      >
        [ {{ weatherData.location.name }} ]
      </span>
      <span
        class="weather-data-time ml-2 text-xs text-gray-400 italic cursor-pointer invisible"
        @click="getWeather(true)"
      >
        {{ dayjs(updatedAt).format('HH:mm') }}
      </span>
    </div>
    <div>
      <span v-if="todayText">{{ todayText }}</span>
      <span class="mx-1">/</span>
      <span>{{ weatherData.now.temperature }} ℃</span>
      <span class="mx-1">/</span>
      <span>湿度 {{ weatherData.now.humidity }}%</span>
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
