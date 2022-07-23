<script setup lang="ts">
import { useSystemState } from '@renderer/store/system'
import { invokeApi } from '@renderer/utils/ipcMessage'
import { NavList } from '@renderer/setting'

const data = reactive({
  showMore: false,
  showMoreHold: false,
})
const { showMore, showMoreHold } = toRefs(data)

const systemState = useSystemState()
const { showSideNav, isTop, isDark, showBar, hoverShowBar } = storeToRefs(systemState)

const toggleSideNav = () => {
  systemState.toggleBar(false)
  systemState.toggleSideNav(!showSideNav.value)
  setTimeout(() => {
    systemState.toggleBar(true)
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

const toggleClose = () => {
  invokeApi({
    name: 'close-app',
  })
}

const toggleHide = () => {
  invokeApi({
    name: 'hide-app',
  })
}

const toggleShowMore = (status: boolean) => {
  data.showMore = status
}

const toggleHoverShowBar = (status: boolean) => {
  systemState.toggleHoverShowBar(status)
}

const toggleBar = (status: boolean) => {
  if (hoverShowBar.value)
    systemState.toggleBar(status)
}
</script>

<template>
  <div
    class="menubar-container flex-grow-0 flex-shrink-0 h-[40px]"
    @mouseenter="toggleBar(true)"
    @mouseleave="toggleBar(false)"
  >
    <Transition appear>
      <div v-if="showBar" class="h-full flex items-center">
        <div class="flex items-center ml-4 text-[16px]">
          <mdi-chevron-double-left
            v-if="showSideNav" class="bar-arrow bar-arrow-left"
            @click="toggleSideNav()"
          />
          <mdi-chevron-double-right
            v-if="!showSideNav" class="bar-arrow bar-arrow-right"
            @click="toggleSideNav()"
          />
        </div>

        <div v-if="!showSideNav" class="nav-list flex items-center ml-8">
          <div
            v-for="item in NavList" :key="item.path"
            class="nav-container relative bg-light-300text-[14px] cursor-pointer mr-2 flex items-center hover:(underline decoration-2 underline-offset-4)"
            :class="{ 'font-bold text-red-600': $route.path === item.path }"
            :title="item.name"
            @click="$router.push({ path: item.path })"
          >
            <div class="nav-des bg px-[8px] pt-2 w-auto">
              {{ item.name }}
            </div>
            <mdi-view-dashboard-outline v-if="item.path === '/dashboard'" />
            <mdi:format-float-left v-if="item.path === '/info'" />
            <mdi-inbox-full-outline v-if="item.path === '/subject'" />
            <mdi:view-grid-outline v-if="item.path === '/module'" />
          </div>
          <n-divider vertical class="mr-2" />
          <div class="nav-container flex items-center relative">
            <div class="flex items-center">
              <div class="nav-des bg px-[8px] pt-2 w-auto">
                搜索
              </div>
              <mdi:target-variant class="cursor-pointer" @click="systemState.toggleSearch()" />
            </div>
          </div>
        </div>
        <div class="flex-grow flex justify-end items-center gap-2 mr-6">
          <div
            class=" flex items-center gap-2"
            @mouseover="toggleShowMore(true)"
            @mouseleave="toggleShowMore(false)"
          >
            <template v-if="showMore || showMoreHold">
              <mdi-brightness-2
                v-if="isDark"
                class="bar-theme"
                @click="toggleDark()"
              />
              <mdi-brightness-7
                v-else
                class="bar-theme"
                @click="toggleDark()"
              />

              <mdi-square-rounded
                v-if="isTop"
                class="bar-pin"
                @click="togglePin(false)"
              />
              <mdi-square-rounded-outline
                v-else class="bar-pin"
                @click="togglePin(true)"
              />

              <mdi-circle-box-outline
                v-if="hoverShowBar"
                class="bar-hover-show"
                @click="toggleHoverShowBar(false)"
              />
              <mdi-circle-box
                v-else
                class="bar-hover-show"
                @click="toggleHoverShowBar(true)"
              />
            </template>

            <mdi-chevron-right-box
              v-if="showMoreHold"
              class="bar-show-more ml-2"
              @click="() => data.showMoreHold = false"
            />
            <mdi-chevron-left-box
              v-else
              class="bar-show-more ml-2"
              @click="() => data.showMoreHold = true"
            />
          </div>

          <mdi-chevron-down-box
            class="bar-hide"
            @click="toggleHide()"
          />
          <mdi-close-box
            class="bar-close"
            @click="toggleClose()"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="less">
.menubar-container {
  .bar-arrow,
  .bar-pin,
  .bar-theme,
  .bar-show-more,
  .bar-close,
  .bar-hide,
  .bar-hover-show {
    cursor: pointer;
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

.nav-des {
  display: none;
  position: absolute;
  bottom: 24px;
  left: -7px;
}
.nav-container {
  &:hover {
    .nav-des {
      display: inline-flex !important;
    }
  }
}
</style>
