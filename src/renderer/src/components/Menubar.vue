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
    class="menubar-container cursor-default flex-grow-0 flex-shrink-0 flex items-center"
    :class="{ 'pl-[82px]': !showSideNav }"
  >
    <Transition name="arrow-left" appear>
      <mdi-chevron-double-left
        v-if="showSideNav" class="bar-arrow bar-arrow-left cursor-pointer text-xl ml-2 opacity-0 hover:(opacity-100)"
        @click="toggleSideNav()"
      />
    </Transition>
    <Transition name="arrow-right" appear>
      <mdi-chevron-double-right
        v-if="!showSideNav" class="bar-arrow bar-arrow-right cursor-pointer text-xl ml-2 opacity-0 hover:(opacity-100)"
        @click="toggleSideNav()"
      />
    </Transition>
  </Dragbar>
</template>

<style scoped lang="less">
.menubar-container {
  &:hover {
    .bar-arrow {
      opacity: 1;
    }
  }
}
.arrow-left-enter-active,
.arrow-right-enter-active {
  transition: opacity 0.5s ease 0.3s ;
}
.arrow-left-leave-active,
.arrow-right-leave-active {
  transition: opacity 0s;
}
.arrow-left-enter-from,
.arrow-right-enter-from,
.arrow-left-leave-from,
.arrow-right-leave-from {
  opacity: 0 !important;
}
</style>
