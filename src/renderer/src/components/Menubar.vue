<script setup lang="ts">
import { useSystemState } from '@renderer/store/system'
import { invokeApi } from '@renderer/utils/ipcMessage'

const data = reactive({
  showBar: true,
})
const { showBar } = toRefs(data)

const systemState = useSystemState()
const { showSideNav, isTop, isDark } = storeToRefs(systemState)

const toggleSideNav = () => {
  data.showBar = false
  systemState.toggleSideNav(!showSideNav.value)
  setTimeout(() => {
    data.showBar = true
  }, 0.5)
}

const togglePin = (status: boolean) => {
  invokeApi({
    name: 'pin',
    data: {
      status,
    },
  })
}

const toggleDark = () => {
  systemState.toggleDark(!isDark.value)
}
</script>

<template>
  <Dragbar
    class="menubar-container flex-grow-0 flex-shrink-0"
    :class="{ 'pl-[82px]': !showSideNav }"
  >
    <Transition appear>
      <div v-if="showBar" class="h-full flex flex-row items-center">
        <mdi-chevron-double-left
          v-if="showSideNav" class="bar-arrow bar-arrow-left text-xl ml-2 opacity-0 hover:(opacity-100)"
          @click="toggleSideNav()"
        />
        <mdi-chevron-double-right
          v-if="!showSideNav" class="bar-arrow bar-arrow-right text-xl ml-2 opacity-0 hover:(opacity-100)"
          @click="toggleSideNav()"
        />

        <mdi:brightness-2
          v-if="isDark"
          class="bar-theme ml-4 opacity-0 hover:(opacity-100)"
          @click="toggleDark()"
        />
        <mdi-brightness-7
          v-else class="bar-theme ml-4 opacity-0 hover:(opacity-100)"
          @click="toggleDark()"
        />

        <mdi-square-rounded
          v-if="isTop" class="bar-pin ml-2 opacity-0 hover:(opacity-100)"
          @click="togglePin(false)"
        />
        <mdi-square-rounded-outline
          v-else class="bar-pin ml-2 opacity-0 hover:(opacity-100)"
          @click="togglePin(true)"
        />
      </div>
    </Transition>
  </Dragbar>
</template>

<style scoped lang="less">
.menubar-container {
  &:hover {
    .bar-arrow,
    .bar-pin,
    .bar-theme {
      opacity: 1;
    }
  }
}

.v-enter-active {
  transition: opacity 0.5s ease 0.3s ;
}
.v-leave-active {
  transition: opacity 0s;
}
.v-enter-from,
.v-leave-from {
  opacity: 0 !important;
}
</style>
