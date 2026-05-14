<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2 style="margin: 0 0 20px;">保险管理后台</h2>
      <el-form :model="form" label-width="0" @submit.prevent>
        <el-form-item>
          <el-input v-model="form.username" placeholder="账号" prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-button
          type="primary"
          style="width: 100%"
          :loading="loading"
          @click="onLogin"
        >登录</el-button>
      </el-form>
      <p style="margin-top: 16px; color: #888; font-size: 12px;">
        默认账号：admin / admin@123
      </p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { callFn } from '@/api/cloudbase';

const router = useRouter();
const form = reactive({ username: '', password: '' });
const loading = ref(false);

async function onLogin() {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入账号密码');
    return;
  }
  loading.value = true;
  try {
    const res: any = await callFn('adminLogin', form);
    if (!res || !res.success) {
      ElMessage.error(res?.message || '登录失败');
      return;
    }
    localStorage.setItem('admin_token', res.token);
    localStorage.setItem('admin_info', JSON.stringify(res.admin));
    ElMessage.success('登录成功');
    router.replace({ name: 'Users' });
  } catch (e: any) {
    ElMessage.error(e.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
}
.login-card { width: 90%; max-width: 380px; }
</style>
