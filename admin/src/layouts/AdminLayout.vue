<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo">保险管理后台</div>
      <el-menu
        :default-active="route.name as string"
        background-color="#001529"
        text-color="#cbd5e1"
        active-text-color="#fff"
        router
      >
        <el-menu-item index="/users" route="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/article" route="/article">
          <el-icon><Document /></el-icon>
          <span>隐私协议</span>
        </el-menu-item>
      </el-menu>
    </aside>
    <main class="main">
      <header class="topbar">
        <div></div>
        <div>
          <span style="margin-right: 12px; color: #555;">{{ admin?.username }}</span>
          <el-button text @click="logout">退出</el-button>
        </div>
      </header>
      <section class="content">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const admin = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('admin_info') || 'null');
  } catch { return null; }
});

function logout() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_info');
  router.replace({ name: 'Login' });
}
</script>
