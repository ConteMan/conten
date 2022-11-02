<template>
  <div class="flex flex-col w-full h-screen max-h-screen">
    <div class="drag flex-shrink-0 flex-grow-0 w-full h-[32px]" />
    <router-view class="h-[calc(100% - 32px)] flex-grow flex-shrink overflow-auto" />
  </div>
</template>
