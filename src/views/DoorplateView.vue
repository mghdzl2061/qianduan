<template>
  <div class="doorplate-page">
    <header><div class="doorplate-brand"><span class="qr-mark"></span><div><b>智慧门牌</b><small>房屋电子身份档案</small></div></div><el-button v-if="!auth.token" text @click="$router.push('/login')">登录系统</el-button></header>
    <main v-loading="loading">
      <section v-if="house" class="plate-card">
        <div class="plate-number mono">DIGITAL HOUSE RECORD</div>
        <div class="address"><span>{{ house.communityName }}</span><h1>{{ house.buildingName }} · {{ house.unitNo }}{{ house.roomNo }}</h1><p>{{ house.address }}</p></div>
        <div class="status-line"><span :class="house.usageStatus"></span><b>{{ statusText[house.usageStatus] }}</b><small>当前登记 {{ house.currentTenantCount }} 位承租人</small></div>
        <div class="facts"><div><span>所在楼层</span><b>{{ house.floorNo }}层</b></div><div><span>建筑面积</span><b>{{ house.area || '—' }}㎡</b></div><div><span>户型</span><b>{{ house.houseType || '未登记' }}</b></div></div>
        <div class="privacy"><el-icon><Lock /></el-icon><div><b>隐私信息已保护</b><p>房东、承租人与民警登录后，根据角色查看授权范围内的房屋档案。</p></div></div>
        <div class="actions"><el-button type="primary" size="large" @click="goBusiness">{{ auth.token ? '进入业务办理' : '登录后办理业务' }}</el-button><el-button v-if="!house.ownerRegistered" size="large" @click="openOwnerApply">房东认证</el-button><el-button size="large" @click="$router.push('/notices')" v-if="auth.token">查看社区公告</el-button></div>
      </section>
      <section v-if="house" class="notice-section"><h2>社区公告</h2><div v-if="house.policeContacts?.length" class="contact-block"><div class="contact-heading"><el-icon><PhoneFilled /></el-icon>社区警务联系</div><div v-for="police in house.policeContacts" :key="police.policeNo||police.phone" class="police-contact"><div><b>{{police.name}}</b><small>{{police.policeNo?`警号 ${police.policeNo}`:'社区民警'}}</small></div><a v-if="police.phone" :href="`tel:${police.phone}`"><el-icon><Phone /></el-icon>{{police.phone}}</a></div></div><article v-for="notice in house.notices" :key="notice.id"><span>{{ typeText[notice.type] }}</span><b>{{ notice.title }}</b><small>{{ formatDate(notice.publishedAt) }}</small></article></section>
    </main>
    <footer>智慧门牌仅作为房屋电子身份入口，不在二维码中存储个人隐私信息。</footer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import http from '../api/http'
import { useAuthStore } from '../stores/auth'
const route = useRoute(), router = useRouter(), auth = useAuthStore()
const loading = ref(true), house = ref(null)
const statusText = { VACANT: '当前空置', SELF_OCCUPIED: '房东自住', RENTED: '正在出租' }
const typeText = { GENERAL: '社区', SAFETY: '安全', POLICY: '政策' }
onMounted(async () => { try { house.value = await http.get(`/public/doorplates/${route.params.publicId}`) } finally { loading.value = false } })
function goBusiness() { if (!auth.token) router.push('/login'); else router.push(auth.role === 'POLICE' ? '/patrols' : '/tenancies') }
function openOwnerApply() { router.push({ path: '/owner-register', query: { publicId: route.params.publicId } }) }
function formatDate(value) { return dayjs(value).format('YYYY-MM-DD') }
</script>

<style scoped>
.doorplate-page { min-height: 100vh; background: #edf4f4; color: #17324d; }.doorplate-page > header { height: 70px; display: flex; align-items: center; justify-content: space-between; padding: 0 max(24px, calc((100vw - 920px)/2)); background: #16364f; color: #fff; }.doorplate-brand { display: flex; align-items: center; gap: 11px; }.doorplate-brand b,.doorplate-brand small { display: block; }.doorplate-brand small { color: #98b4c1; font-size: 9px; margin-top: 3px; letter-spacing: .12em; }.qr-mark { width: 24px; height: 24px; border: 5px solid #55c7b3; box-shadow: inset 0 0 0 3px #16364f; }
main { max-width: 920px; margin: 0 auto; padding: 40px 20px 80px; display: grid; grid-template-columns: 1.25fr .75fr; gap: 18px; }.plate-card,.notice-section { background: #fff; border: 1px solid #d7e4e6; border-radius: 18px; }.plate-card { padding: 28px; position: relative; overflow: hidden; }.plate-card::after { content: ''; position: absolute; width: 210px; height: 210px; right: -95px; top: -95px; border: 24px solid #0e8a7a; border-radius: 50%; opacity: .05; }.plate-number { font-size: 9px; letter-spacing: .18em; color: #8fa2ab; }.address { margin: 30px 0 24px; }.address > span { color: #0e8a7a; font-size: 12px; font-weight: 700; }.address h1 { font-size: 28px; margin: 10px 0; }.address p { color: #7e939d; font-size: 12px; }.status-line { display: flex; align-items: center; gap: 9px; padding: 14px; background: #f3f8f8; border-radius: 10px; }.status-line > span { width: 10px; height: 10px; border-radius: 50%; background: #9eb1ba; }.status-line > span.RENTED { background: #0e8a7a; }.status-line > span.SELF_OCCUPIED { background: #173c57; }.status-line small { margin-left: auto; color: #81949d; }.facts { display: grid; grid-template-columns: repeat(3,1fr); margin: 22px 0; border: 1px solid #e2eaec; }.facts div { padding: 15px; border-right: 1px solid #e2eaec; }.facts div:last-child { border: 0; }.facts span,.facts b { display: block; }.facts span { font-size: 10px; color: #8ca0aa; }.facts b { margin-top: 7px; font-size: 13px; }.privacy { display: flex; gap: 12px; color: #56707f; padding: 15px 0; }.privacy b { font-size: 12px; }.privacy p { font-size: 11px; line-height: 1.6; margin: 5px 0 0; }.actions { display: flex; gap: 10px; margin-top: 12px; }.notice-section { padding: 24px; align-self: start; }.notice-section h2 { font-size: 16px; margin: 0 0 16px; }.notice-section article { padding: 15px 0; border-top: 1px solid #e6edef; }.notice-section article span { color: #0e8a7a; font-size: 9px; margin-right: 8px; }.notice-section article b { font-size: 12px; }.notice-section article small { display: block; color: #97a8b0; font-size: 9px; margin-top: 7px; }.doorplate-page > footer { text-align: center; padding: 22px; color: #879ba5; font-size: 10px; }
.contact-block { padding: 13px; margin-bottom: 6px; border: 1px solid #d8e9e6; border-radius: 11px; background: #f1f8f7; }.contact-heading { display: flex; align-items: center; gap: 6px; color: #0e8a7a; font-size: 10px; font-weight: 700; margin-bottom: 9px; }.police-contact { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 0; border-top: 1px solid #deebe9; }.police-contact:first-of-type { border-top: 0; }.police-contact b,.police-contact small { display: block; }.police-contact b { font-size: 12px; }.police-contact small { color: #8398a2; font-size: 9px; margin-top: 4px; }.police-contact a { display: flex; align-items: center; gap: 4px; color: #0e8a7a; font-size: 11px; font-weight: 700; text-decoration: none; white-space: nowrap; }
.apply-mode { display: flex; margin-bottom: 14px; }.apply-mode :deep(.el-radio-button) { flex: 1; }.apply-mode :deep(.el-radio-button__inner) { width: 100%; }
@media(max-width:760px){ main{grid-template-columns:1fr;padding-top:20px}.plate-card{padding:22px}.address h1{font-size:23px}.facts div{padding:11px}.actions{flex-direction:column}.doorplate-page > header{padding:0 18px} }
</style>
