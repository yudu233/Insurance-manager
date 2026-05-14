import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/pages/Login.vue') },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/users',
    children: [
      { path: 'users', name: 'Users', component: () => import('@/pages/Users.vue') },
      { path: 'article', name: 'Article', component: () => import('@/pages/ArticleEdit.vue') }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to) => {
  const token = localStorage.getItem('admin_token');
  if (to.name !== 'Login' && !token) {
    return { name: 'Login' };
  }
});

export default router;
