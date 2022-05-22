<script setup lang="ts">
import { useSystemState } from '@renderer/store/system'
import { invokeApi } from '@renderer/utils/ipcMessage'

const systemState = useSystemState()
const { showSideNav, isTop } = storeToRefs(systemState)

const toggleSideNav = () => {
  systemState.toggleSideNav(!showSideNav.value)
}

const togglePin = (status: boolean) => {
  invokeApi({
    name: 'pin',
    data: {
      status,
    },
  })
}
</script>

<template>
  <Dragbar
    class="menubar-container flex-grow-0 flex-shrink-0"
    :class="{ 'pl-[82px]': !showSideNav }"
  >
    <div class="h-full flex flex-row items-center">
      <Transition name="arrow-left" appear>
        <mdi-chevron-double-left
          v-if="showSideNav" class="bar-arrow bar-arrow-left text-xl ml-2 opacity-0 hover:(opacity-100)"
          @click="toggleSideNav()"
        />
      </Transition>
      <Transition name="arrow-right" appear>
        <mdi-chevron-double-right
          v-if="!showSideNav" class="bar-arrow bar-arrow-right text-xl ml-2 opacity-0 hover:(opacity-100)"
          @click="toggleSideNav()"
        />
      </Transition>
      <mdi-pin
        v-if="isTop" class="bar-pin ml-4 opacity-0 hover:(opacity-100)"
        @click="togglePin(false)"
      />
      <mdi-pin-off
        v-else class="bar-pin ml-4 opacity-0 hover:(opacity-100)"
        @click="togglePin(true)"
      />
    </div>
  </Dragbar>
</template>

<style scoped lang="less">
.menubar-container {
  &:hover {
    .bar-arrow,.bar-pin {
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
