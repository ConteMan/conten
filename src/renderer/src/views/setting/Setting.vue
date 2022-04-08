<template>
  <div>
    <div class="text-[14px]">
      <span class="text-gray-400">[</span>
      系统设置
      <span class="text-gray-400">]</span>
    </div>
    <hr class="mt-4 mb-2"/>
    <n-form
      ref="formRef"
      size="small"
      :model="formValue"
    >
      <div class="w-[40%]">
        <n-form-item
          label="姓名"
          path="user.name"
        >
          <n-input v-model:value="formValue.user.name" placeholder="输入姓名" />
        </n-form-item>
        <n-form-item label="年龄" path="user.age">
          <n-input v-model:value="formValue.user.age" placeholder="输入年龄" />
        </n-form-item>
        <n-form-item label="电话号码" path="user.phone">
          <n-input v-model:value="formValue.phone" placeholder="电话号码" />
        </n-form-item>
      </div>
    </n-form>
  </div>
</template>

<script setup lang="ts">
const data = reactive({
  formValue: {
    user: {
      name: '',
      age: '',
    },
    phone: '',
  },
  formShowLabel: true,
  formItemShowLabel: true,
}) 
const { formValue } = toRefs(data)

const formRef = ref(null)
</script>
