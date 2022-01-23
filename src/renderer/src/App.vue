<template>
  <div class="top-bar">
    drag
  </div>
  <div class="logo-box">
    <img style="height:140px;" src="./assets/electron.png" alt="Electron logo">
    <span/>
    <img style="height:140px;" alt="Vite logo" src="./assets/vite.svg" />
    <span/>
    <img style="height:140px;" alt="Vue logo" src="./assets/vue.png" />
  </div>
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
  <div class="static-public">
    Place static files into the <code>src/renderer/public</code> folder
    <img style="width:90px;" :src="'./images/node.png'" />
  </div>
  <div class="space-x-2">
    <button class="rounded-md p-2 bg-dark-50 text-light-50" @click="send()">启动</button>
    <button class="rounded-md p-2 bg-dark-50 text-light-50" @click="send2()">停止</button>
  </div>
</template>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import HelloWorld from './components/HelloWorld.vue'

const send = () => {
  window.ipcRenderer.send('indexMsg','启动')
}
const send2 = () => {
  window.ipcRenderer.send('indexMsg-2','停止')
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.logo-box {
  display: flex;
  width: 100%;
  justify-content: center;
}

.logo-box span {
  width: 74px;
}

.static-public {
  display: flex;
  align-items: center;
  justify-content: center;
}

.static-public code {
  background-color: #eee;
  padding: 2px 4px;
  margin: 0 4px;
  border-radius: 4px;
  color: #304455;
}
.top-bar {
  -webkit-app-region: drag;
  height: 2rem;
  width: 100%;
}
</style>
