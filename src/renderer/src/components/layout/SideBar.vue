<script setup lang='ts'>
import { useWindowState } from '@renderer/store'

const windowState = useWindowState()
const { showSideBar } = storeToRefs(windowState)
const toggleSideBar = () => {
  windowState.toggleSideBar()
}
</script>

<template>
  <div class="side-bar flex">
    <div
      class="menu-container flex-grow overflow-x-hidden"
      :class="[showSideBar ? 'w-[78px] opacity-100' : 'w-0 opacity-0']"
    >
      <div v-if="showSideBar" class="menu-inner-container w-full flex flex-col justify-start items-center py-8 gap-4" />
    </div>
    <div
      class="toggle-bar cursor-pointer relative flex-grow-0 flex-shrink-0 w-[8px] opacity-0 hover:opacity-100"
      @click="toggleSideBar()"
    >
      <mdi:chevron-double-left class="absolute top-1/3" :class="{ 'rotate-180': !showSideBar }" />
    </div>
  </div>
</template>

<style scoped>
.menu-container {
  transition: width 0.3s, opacity 0.3s ease 0.1s;
}
</style>
