<template>
  <div class="w-full h-screen max-h-screen overflow-hidden flex flex-col">
    <title-bar class="h-[32px]" />
    <div class="main-content flex-grow flex-shrink flex overflow-hidden">
      <side-bar class="h-full flex-grow-0 flex-shrink-0" />
      <router-view v-slot="{ Component }" class="w-full h-full max-h-full flex-grow flex-shrink flex flex-col overflow-hidden">
        <transition mode="out-in" appear>
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <status-bar class="h-[20px] flex-grow-0 flex-shrink-0" />
  </div>
</template>

<style scoped>
.v-enter-active {
  transition: opacity 0.3s linear;
}
.v-enter-from,
.v-leave-to,
.v-leave-from {
  opacity: 0;
}
</style>
