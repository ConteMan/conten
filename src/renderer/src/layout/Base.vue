<template>
  <div class="w-full h-screen max-h-screen overflow-hidden flex flex-col">
    <title-bar class="h-[32px]" />
    <div class="main-content flex-grow flex-shrink flex overflow-hidden">
      <side-bar class="h-full flex-grow-0 flex-shrink-0" />
      <router-view class="w-full h-full max-h-full flex-grow flex-shrink flex flex-col overflow-hidden" />
    </div>
    <status-bar class="h-[20px] flex-grow-0 flex-shrink-0" />
  </div>
</template>
