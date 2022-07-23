<script setup lang="ts">
import { debouncedWatch, onKeyStroke, onStartTyping, useActiveElement, useEventListener, useMouse } from '@vueuse/core'
import { useSystemState } from '@renderer/store/system'
import { toLower } from 'lodash'

const searchKey = 's'
const resultContainerHeight = 400 // 结果框的高度

interface RouteResult {
  name: string
  type: string
  path: string
}
const routes: RouteResult[] = [
  {
    name: '面板',
    type: 'Nav',
    path: '/dashboard',
  },
  {
    name: '资讯',
    type: 'Nav',
    path: '/info',
  },
  {
    name: '条目',
    type: 'Nav',
    path: '/subject',
  },
  {
    name: '模块',
    type: 'Nav',
    path: '/module',
  },
]

const data = reactive({
  searchContent: '',
  result: [] as RouteResult[],
  index: 0, // 选中结果索引
  resultRefs: {} as any, // 搜索结果引用
  mode: 1, // 1 鼠标，2 键盘
  searchMode: 1, // 1 历史记录， 2 书签, 3 搜索引擎
})
const { searchContent, result, resultRefs, index } = toRefs(data)

const systemState = useSystemState()
const { showSearch: show } = storeToRefs(systemState)

const activeElement = useActiveElement()
const notUsingInput = computed(() =>
  activeElement.value?.tagName !== 'INPUT'
  && activeElement.value?.tagName !== 'TEXTAREA',
)

// 监听按键事件
useEventListener(window, 'keyup', (e: any) => {
  // 搜索
  if (toLower(e.key) === searchKey && notUsingInput.value)
    systemState.toggleSearch()
})

const searchNav = () => {
  data.result = routes
  data.index = 0
}

// 初始化
watch(show, (newValue) => {
  if (newValue) {
    data.searchContent = ''
    searchNav()
  }
})

// 带防抖的搜索请求处理
debouncedWatch(searchContent, (newValue) => {
  searchNav()
}, { debounce: 300 })

// 输入框始终获取焦点
const searchInputRef: any = ref(null)
onStartTyping(() => {
  if (show.value && !searchInputRef.value.active)
    searchInputRef.value.focus()
})

const router = useRouter()
// 执行结果
const resultSubmit = () => {
  const path = result.value[index.value].path
  router.push({ path })
  systemState.toggleSearch(false)
}

// 结果容器引用
const resultRef: any = ref(null)

// 向上按键操作
const upAction = () => {
  data.mode = 2
  if (data.index > 0)
    data.index--

  if (!data.resultRefs[data.index] || !resultRef.value)
    return

  // 当前元素顶部距父元素顶部距离 < 父元素滚动距离
  if (data.resultRefs[data.index].offsetTop - resultRef.value.offsetTop < resultRef.value.scrollTop) {
    data.resultRefs[data.index].scrollIntoView({
      behavior: 'smooth', // 平滑过渡
      block: 'start', // 上边框与视窗顶部平齐。默认值
    })
  }
}

// 向下按键操作
const downAction = () => {
  data.mode = 2
  if (data.index < (data.result.length - 1))
    data.index++

  if (!data.resultRefs[data.index] || !resultRef.value)
    return

  // 当前元素顶部距父元素顶部距离 + 元素高度 > 父元素滚动距离 + 父元素可视高度
  if (data.resultRefs[data.index].offsetTop - resultRef.value.offsetTop + data.resultRefs[data.index].clientHeight > resultRef.value.scrollTop + resultContainerHeight) {
    data.resultRefs[data.index].scrollIntoView({
      behavior: 'smooth', // 平滑过渡
      block: 'end', // 下边框与视窗顶部平齐
    })
  }
}

onKeyStroke('ArrowUp', (e) => {
  upAction()
  e.preventDefault()
})

onKeyStroke('ArrowDown', (e) => {
  downAction()
  e.preventDefault()
})

onKeyStroke('Enter', (e) => {
  resultSubmit()
})

onKeyStroke('Tab', (e) => {
  if (e.shiftKey && e.key === 'Tab' && e.type === 'keydown')
    upAction()
  else
    downAction()
  e.preventDefault()
})

// 判断激活
const active = (key: number) => {
  return key === data.index
}

// 鼠标事件设置激活
const setIndex = (index: number) => {
  if (data.mode === 1)
    data.index = index
}

// 更新模板引用
onBeforeUpdate(() => {
  resultRefs.value = []
})

// 鼠标移动则设置鼠标模式
const { x, y } = useMouse({ touch: false })
watch(x, () => {
  data.mode = 1
})
watch(y, () => {
  data.mode = 1
})
</script>

<template>
  <n-modal
    v-model:show="show"
    :auto-focus="true"
    transform-origin="center"
  >
    <div class="bg w-1/2 rounded-sm">
      <n-input
        ref="searchInputRef"
        placeholder="Search"
        size="large"
        class="search-input"
      />
      <div
        ref="resultRef"
        class="bg w-full rounded-sm overflow-y-auto"
        :style="{ height: `${resultContainerHeight}px` }"
      >
        <div
          v-for="(item, index) in result"
          :key="item.name"
          :ref="el => { if (el) resultRefs[index] = el }"
          class="py-2 px-4 cursor-pointer flex items-center"
          @click="resultSubmit()"
          @mouseover="setIndex(index)"
        >
          <div
            class="flex-grow"
            :class="{ 'font-bold text-red-400': active(index) }"
          >
            {{ item.name }}
          </div>
          <div class="text-gray-400">
            {{ item.type }}
          </div>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<style lang="less">
.search-input {
  border: none !important;
  box-shadow: none !important;
  div {
    border: none !important;
    box-shadow: none !important;
  }
}
.n-input:not(.n-input--disabled).n-input--focus {
  background: none !important;
  box-shadow: none !important;
}
</style>
