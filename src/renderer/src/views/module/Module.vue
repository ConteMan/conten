<script setup lang="ts">
import { ModuleNavList } from '@renderer/setting'
</script>

<template>
  <div class="py-4 px-8">
    <div class="flex flex-wrap gap-2">
      <div
        v-for="item in ModuleNavList" :key="item.path"
        class="p-8 h-auto cursor-pointer rounded-sm border border-light-800 text-[14px] hover:(font-bold text-red-400 border-red-400)"
        @click="$router.push({ path: item.path })"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
