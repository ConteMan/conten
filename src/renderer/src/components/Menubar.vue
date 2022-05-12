<script setup lang="ts">
import { useSystemState } from '@renderer/store/system'

const systemState = useSystemState()
const { showSideNav } = storeToRefs(systemState)

const toggleSideNav = () => {
  systemState.toggleSideNav(!showSideNav.value)
}
</script>

<template>
  <Dragbar
    class="menubar-container flex-grow-0 flex-shrink-0 flex items-center"
    :class="{ 'pl-[82px]': !showSideNav }"
  >
    <mdi-chevron-double-left
      v-if="showSideNav" class="bar-arrow cursor-pointer text-xl ml-2 opacity-0 hover:(opacity-100)"
      @click="toggleSideNav()"
    />
    <mdi-chevron-double-right
      v-else class="bar-arrow cursor-pointer text-xl ml-2 opacity-0 hover:(opacity-100)"
      @click="toggleSideNav()"
    />
  </Dragbar>
</template>

<style lang="less">
.menubar-container {
  &:hover {
    .bar-arrow {
      opacity: 1;
    }
  }
}
</style>
