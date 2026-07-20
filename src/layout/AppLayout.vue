<template>
  <div class="app-frame">
    <aside class="sidebar" :class="{ compact: collapsed }">
      <div class="brand">
        <div class="brand-mark"><span></span><span></span><span></span><span></span></div>
        <div v-if="!collapsed">
          <strong>智慧门牌</strong>
          <small>社区数字档案</small>
        </div>
      </div>
      <div v-if="!collapsed" class="district-tag"><i></i> 西安 · 社区治理端</div>
      <el-menu :default-active="$route.path" router :collapse="collapsed" class="nav-menu">
        <template v-for="group in visibleGroups" :key="group.label">
          <div v-if="!collapsed" class="menu-caption">{{ group.label }}</div>
          <el-menu-item v-for="item in group.items" :key="item.path" :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon><template #title>{{ item.label }}</template>
          </el-menu-item>
        </template>
      </el-menu>
      <button class="collapse-button" @click="collapsed = !collapsed">
        <el-icon><component :is="collapsed ? 'Expand' : 'Fold'" /></el-icon>
        <span v-if="!collapsed">收起导航</span>
      </button>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div>
          <span class="route-kicker">DIGITAL DOORPLATE</span>
          <strong>{{ $route.meta.title || '智慧门牌' }}</strong>
        </div>
        <div class="top-actions">
          <el-badge :value="auth.unreadCount" :hidden="!auth.unreadCount" class="message-badge">
            <el-button circle text @click="$router.push('/messages')"><el-icon><Bell /></el-icon></el-button>
          </el-badge>
          <div class="user-chip" @click="$router.push('/profile')">
            <span class="avatar">{{ auth.user?.realName?.slice(-1) }}</span>
            <div><strong>{{ auth.user?.realName }}</strong><small>{{ roleText[auth.role] }}</small></div>
          </div>
          <el-button text class="logout" @click="logout"><el-icon><SwitchButton /></el-icon></el-button>
        </div>
      </header>
      <main class="content"><router-view /></main>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const collapsed = ref(false)
const roleText = { ADMIN: '系统管理员', POLICE: '社区民警', OWNER: '房东', TENANT: '承租人' }

const groups = [
  { label: '工作台', items: [
    { path: '/dashboard', label: '数据总览', icon: 'DataBoard' },
    { path: '/messages', label: '消息中心', icon: 'Bell' }
  ]},
  { label: '房屋档案', items: [
    { path: '/communities', label: '社区管理', icon: 'OfficeBuilding', roles: ['ADMIN'] },
    { path: '/buildings', label: '楼栋管理', icon: 'School', roles: ['ADMIN'] },
    { path: '/houses', label: '房屋与门牌', icon: 'House' }
  ]},
  { label: '人口服务', items: [
    { path: '/tenants', label: '承租人管理', icon: 'UserFilled' },
    { path: '/tenancies', label: '入住登记与审核', icon: 'DocumentChecked' },
    { path: '/permits', label: '居住证办理', icon: 'Postcard' }
  ]},
  { label: '社区治理', items: [
    { path: '/patrols', label: '巡查任务', icon: 'Location', roles: ['ADMIN', 'POLICE'] },
    { path: '/notices', label: '通知公告', icon: 'Notification' }
  ]},
  { label: '系统设置', items: [
    { path: '/users', label: '用户管理', icon: 'User', roles: ['ADMIN'] },
    { path: '/logs', label: '操作日志', icon: 'Tickets', roles: ['ADMIN'] },
    { path: '/profile', label: '个人中心', icon: 'Setting' }
  ]}
]

const visibleGroups = computed(() => groups.map(group => ({
  ...group,
  items: group.items.filter(item => !item.roles || item.roles.includes(auth.role))
})).filter(group => group.items.length))

let timer
onMounted(async () => {
  if (!auth.user) await auth.loadMe().catch(() => {})
  await auth.loadUnread().catch(() => {})
  timer = setInterval(() => auth.loadUnread().catch(() => {}), 30000)
})
onBeforeUnmount(() => clearInterval(timer))

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-frame { min-height: 100vh; display: flex; }
.sidebar { width: 244px; flex: 0 0 244px; background: #16344d; color: #fff; min-height: 100vh; position: sticky; top: 0; align-self: flex-start; display: flex; flex-direction: column; transition: .2s; overflow: hidden; }
.sidebar::after { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .16; background-image: linear-gradient(rgba(255,255,255,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.13) 1px, transparent 1px); background-size: 32px 32px; mask-image: linear-gradient(to bottom, black, transparent 46%); }
.sidebar.compact { width: 68px; flex-basis: 68px; }
.brand { height: 78px; display: flex; align-items: center; gap: 13px; padding: 0 18px; position: relative; z-index: 1; border-bottom: 1px solid rgba(255,255,255,.1); }
.brand strong { font-size: 18px; letter-spacing: .12em; display: block; white-space: nowrap; }
.brand small { display: block; color: #9eb9c8; margin-top: 3px; font-size: 10px; letter-spacing: .12em; }
.brand-mark { display: grid; grid-template-columns: repeat(2, 9px); gap: 3px; min-width: 21px; }
.brand-mark span { width: 9px; height: 9px; background: #55c7b3; border-radius: 2px; }
.brand-mark span:nth-child(2) { background: #efb258; }
.brand-mark span:nth-child(3) { background: transparent; border: 2px solid #55c7b3; }
.district-tag { margin: 16px 16px 6px; padding: 9px 10px; color: #b9d0db; font-size: 11px; border: 1px solid rgba(255,255,255,.11); background: rgba(255,255,255,.04); position: relative; z-index: 1; white-space: nowrap; }
.district-tag i { display: inline-block; width: 6px; height: 6px; background: #55c7b3; border-radius: 50%; margin-right: 7px; box-shadow: 0 0 0 4px rgba(85,199,179,.12); }
.nav-menu { border: 0; background: transparent; position: relative; z-index: 1; flex: 1; padding: 4px 8px; }
.menu-caption { padding: 16px 12px 6px; color: #6f91a4; font-size: 10px; letter-spacing: .18em; }
.nav-menu :deep(.el-menu-item) { color: #bdd0da; height: 43px; border-radius: 8px; margin: 2px 0; }
.nav-menu :deep(.el-menu-item:hover) { background: rgba(255,255,255,.07); color: #fff; }
.nav-menu :deep(.el-menu-item.is-active) { background: #0e8a7a; color: #fff; box-shadow: 0 8px 20px rgba(0,0,0,.16); }
.collapse-button { position: relative; z-index: 1; height: 48px; border: 0; border-top: 1px solid rgba(255,255,255,.1); background: transparent; color: #8da9b8; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
.workspace { flex: 1; min-width: 0; }
.topbar { height: 78px; background: rgba(255,255,255,.94); border-bottom: 1px solid #dce7e9; display: flex; align-items: center; justify-content: space-between; padding: 0 27px; position: sticky; top: 0; z-index: 20; backdrop-filter: blur(10px); }
.route-kicker { display: block; font: 10px/1 "Cascadia Mono", monospace; letter-spacing: .16em; color: #88a0ad; margin-bottom: 7px; }
.topbar strong { font-size: 16px; color: #17324d; }
.top-actions, .user-chip { display: flex; align-items: center; gap: 12px; }
.user-chip { cursor: pointer; padding: 6px 9px; border-radius: 9px; }
.user-chip:hover { background: #f0f6f6; }
.user-chip .avatar { width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; color: #fff; background: #173c57; font-weight: 700; }
.user-chip strong, .user-chip small { display: block; font-size: 12px; }
.user-chip small { color: #8196a2; margin-top: 3px; font-size: 10px; }
.content { min-height: calc(100vh - 78px); }
@media (max-width: 880px) { .sidebar { width: 68px; flex-basis: 68px; } .sidebar .brand > div:last-child, .district-tag, .menu-caption, .collapse-button span { display: none; } .user-chip div { display: none; } }
</style>
