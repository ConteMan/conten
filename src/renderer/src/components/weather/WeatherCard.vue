<script setup lang="ts">
import dayjs from 'dayjs'

const data = reactive({
  weatherData: null as any,
  weatherExpired: null as any,
  showDayWeather: false,
})
const { weatherData, weatherExpired, showDayWeather } = toRefs(data)

const init = async () => {
  const weatherRes = await window.ipcRenderer.invoke('get-weather')
  data.weatherData = weatherRes?.data
  data.weatherExpired = weatherRes?.expired
}

const changeShowDayWeather = () => {
  data.showDayWeather = !data.showDayWeather
}

init()
</script>

<template>
  <div
    v-if="weatherData"
    class="weather-card p-2"
  >
    <div>
      <span class="font-bold cursor-pointer select-none" @click="changeShowDayWeather()">
        {{ weatherData.location.name }}
      </span>
      <span class="weather-data-time ml-2 text-xs text-gray-400 italic invisible">
        {{ dayjs(weatherExpired).format('HH:mm') }}
      </span>
    </div>
    <div>
      <span>{{ weatherData.now.temperature }} ℃</span>
    </div>
    <div v-if="showDayWeather">
      <span class="text-xs text-gray-400">Updated at {{ weatherData.lastUpdate }}</span>
    </div>
    <div v-if="showDayWeather" class="mt-1 flex space-x-4">
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
