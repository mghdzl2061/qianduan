import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/doorplate/:publicId', component: () => import('../views/DoorplateView.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('../layout/AppLayout.vue'),
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { title: '数据总览' } },
      { path: 'communities', component: () => import('../views/BasicResourceView.vue'), props: { type: 'community' }, meta: { title: '社区管理', roles: ['ADMIN'] } },
      { path: 'buildings', component: () => import('../views/BasicResourceView.vue'), props: { type: 'building' }, meta: { title: '楼栋管理', roles: ['ADMIN'] } },
      { path: 'users', component: () => import('../views/UserView.vue'), meta: { title: '用户管理', roles: ['ADMIN'] } },
      { path: 'houses', component: () => import('../views/HouseView.vue'), meta: { title: '房屋与门牌' } },
      { path: 'tenants', component: () => import('../views/TenantView.vue'), meta: { title: '承租人管理' } },
      { path: 'tenancies', component: () => import('../views/TenancyView.vue'), meta: { title: '入住登记与审核' } },
      { path: 'permits', component: () => import('../views/PermitView.vue'), meta: { title: '居住证办理' } },
      { path: 'patrols', component: () => import('../views/PatrolView.vue'), meta: { title: '巡查任务', roles: ['ADMIN', 'POLICE'] } },
      { path: 'notices', component: () => import('../views/NoticeView.vue'), meta: { title: '通知公告' } },
      { path: 'messages', component: () => import('../views/MessageView.vue'), meta: { title: '消息中心' } },
      { path: 'logs', component: () => import('../views/LogView.vue'), meta: { title: '操作日志', roles: ['ADMIN'] } },
      { path: 'profile', component: () => import('../views/ProfileView.vue'), meta: { title: '个人中心' } }
    ]
  }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  if (to.meta.public) return true
  const token = localStorage.getItem('doorplate_token')
  if (!token) return '/login'
  const user = JSON.parse(localStorage.getItem('doorplate_user') || 'null')
  if (to.meta.roles && !to.meta.roles.includes(user?.role)) return '/dashboard'
  return true
})

export default router
