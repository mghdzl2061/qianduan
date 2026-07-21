<template>
  <div class="page-shell dashboard">
    <div class="page-heading">
      <div><h1>{{ greeting }}，{{ auth.user?.realName }}</h1><p>今天是 {{ today }}，这里是社区房屋和业务的实时概览。</p></div>
      <el-button type="primary" @click="$router.push(actionPath)"><el-icon><Plus /></el-icon>{{ actionText }}</el-button>
    </div>
    <section class="summary-grid">
      <article v-for="card in cards" :key="card.label" class="summary-card" :class="card.tone">
        <div class="card-symbol"><el-icon><component :is="card.icon" /></el-icon></div>
        <div><span>{{ card.label }}</span><strong>{{ card.value }}</strong><small>{{ card.note }}</small></div>
      </article>
    </section>
    <section class="dashboard-grid">
      <article class="panel trend-card"><header><div><b>近七日业务趋势</b><span>入住登记与居住证申请</span></div><span class="live"><i></i>实时数据</span></header><div ref="trendRef" class="chart"></div></article>
      <article class="panel status-card"><header><div><b>房屋使用状态</b><span>当前房屋结构</span></div></header><div ref="statusRef" class="chart"></div></article>
      <article class="panel police-card"><header><div><b>民警已完成任务</b><span>按累计完成巡查任务统计</span></div></header><div ref="policeRef" class="chart"></div></article>
      <article class="panel notice-card"><header><div><b>社区最新公告</b><span>重点通知优先展示</span></div><el-button text @click="$router.push('/notices')">查看全部</el-button></header>
        <div class="notice-list"><div v-for="notice in data.recentNotices" :key="notice.id" class="notice-item"><span :class="notice.type"></span><div><b>{{ notice.title }}</b><small>{{ formatDate(notice.publishedAt) }}</small></div><el-tag v-if="notice.pinned" size="small" type="warning">置顶</el-tag></div></div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import http from '../api/http'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const data = reactive({ summary: {}, houseStatus: [], policeCompleted: [], applicationTrend: [], recentNotices: [] })
const trendRef = ref(), statusRef = ref(), policeRef = ref()
const charts = []
const today = dayjs().format('YYYY年M月D日')
const greeting = computed(() => new Date().getHours() < 12 ? '上午好' : new Date().getHours() < 18 ? '下午好' : '晚上好')
const actionText = computed(() => ({ OWNER: '登记承租人', TENANT: '提交入住申请', POLICE: '查看待巡查', ADMIN: '新建房屋档案' }[auth.role]))
const actionPath = computed(() => ({ OWNER: '/tenancies', TENANT: '/tenancies', POLICE: '/patrols', ADMIN: '/houses' }[auth.role]))
const cards = computed(() => [
  { label: '房屋档案', value: data.summary.houseCount || 0, note: '系统登记总数', icon: 'House', tone: 'blue' },
  { label: '当前承租人', value: data.summary.tenantCount || 0, note: '审核通过且在住', icon: 'UserFilled', tone: 'teal' },
  { label: '待审核业务', value: data.summary.pendingAuditCount || 0, note: '入住及居住证', icon: 'DocumentChecked', tone: 'amber' },
  { label: '待完成巡查', value: data.summary.pendingPatrolCount || 0, note: '含逾期任务', icon: 'Location', tone: 'red' }
])

onMounted(load)
onBeforeUnmount(() => { charts.forEach(c => c.dispose()); window.removeEventListener('resize', resize) })
async function load() {
  Object.assign(data, await http.get('/dashboard'))
  await nextTick(); draw(); window.addEventListener('resize', resize)
}
function draw() {
  const trend = echarts.init(trendRef.value); charts.push(trend)
  trend.setOption({ tooltip: { trigger: 'axis' }, legend: { right: 10, top: 5, textStyle: { color: '#708895' } }, grid: { left: 38, right: 18, top: 50, bottom: 28 }, xAxis: { type: 'category', data: data.applicationTrend.map(i => dayjs(i.day).format('MM/DD')), axisLine: { lineStyle: { color: '#dbe6e8' } } }, yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#edf2f3' } } }, series: [ { name: '入住登记', type: 'line', smooth: true, data: data.applicationTrend.map(i => i.tenancyCount), lineStyle: { color: '#0e8a7a', width: 3 }, itemStyle: { color: '#0e8a7a' }, areaStyle: { color: 'rgba(14,138,122,.08)' } }, { name: '居住证', type: 'line', smooth: true, data: data.applicationTrend.map(i => i.permitCount), lineStyle: { color: '#e6a23c', width: 3 }, itemStyle: { color: '#e6a23c' } } ] })
  const statusMap = { VACANT: '空置', SELF_OCCUPIED: '自住', RENTED: '出租中' }
  const status = echarts.init(statusRef.value); charts.push(status)
  status.setOption({ tooltip: { trigger: 'item' }, legend: { bottom: 0, icon: 'circle' }, color: ['#9eb4bd', '#173c57', '#21a68f'], series: [{ type: 'pie', radius: ['53%', '73%'], center: ['50%', '45%'], label: { show: false }, data: data.houseStatus.map(i => ({ name: statusMap[i.name], value: i.value })) }] })
  const police = echarts.init(policeRef.value); charts.push(police)
  police.setOption({ tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } }, grid: { left: 42, right: 18, top: 22, bottom: 32 }, xAxis: { type: 'category', data: data.policeCompleted.map(i => i.name), axisTick: { show: false } }, yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#edf2f3' } } }, series: [{ type: 'bar', data: data.policeCompleted.map(i => i.value), barWidth: 28, itemStyle: { color: '#173c57', borderRadius: [5, 5, 0, 0] }, label: { show: true, position: 'top', color: '#45657a' } }] })
}
function resize() { charts.forEach(c => c.resize()) }
function formatDate(value) { return value ? dayjs(value).format('MM-DD HH:mm') : '' }
</script>

<style scoped>
.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.summary-card { min-height: 126px; border: 1px solid #dce7e9; background: #fff; border-radius: 14px; padding: 21px; display: flex; align-items: center; gap: 16px; position: relative; overflow: hidden; }
.summary-card::after { content: ''; position: absolute; right: -18px; bottom: -38px; width: 90px; height: 90px; border: 13px solid currentColor; border-radius: 50%; opacity: .045; }
.card-symbol { width: 46px; height: 46px; border-radius: 12px; display: grid; place-items: center; font-size: 21px; background: #e8f0f4; color: #173c57; }.teal .card-symbol { background: #dff3ef; color: #0e8a7a; }.amber .card-symbol { background: #fff0d9; color: #c98725; }.red .card-symbol { background: #fae6e6; color: #c84f4f; }
.summary-card span, .summary-card strong, .summary-card small { display: block; }.summary-card span { color: #718995; font-size: 12px; }.summary-card strong { font: 28px/1.2 "Cascadia Mono", monospace; color: #17324d; margin: 7px 0 5px; }.summary-card small { color: #a2b0b7; font-size: 10px; }
.dashboard-grid { display: grid; grid-template-columns: 1.45fr .75fr; gap: 16px; }.panel header { min-height: 66px; padding: 16px 18px; border-bottom: 1px solid #edf2f3; display: flex; align-items: center; justify-content: space-between; }.panel header b, .panel header span { display: block; }.panel header b { font-size: 14px; }.panel header div > span { font-size: 10px; color: #8ba0aa; margin-top: 5px; }.chart { height: 280px; }.live { color: #0e8a7a; font-size: 10px; }.live i { width: 7px; height: 7px; display: inline-block; background: #0e8a7a; border-radius: 50%; margin-right: 5px; }.notice-list { padding: 6px 18px 14px; }.notice-item { display: flex; align-items: center; gap: 11px; padding: 14px 0; border-bottom: 1px solid #edf2f3; }.notice-item:last-child { border: 0; }.notice-item > span { width: 7px; height: 24px; border-radius: 3px; background: #95acb6; }.notice-item > span.SAFETY { background: #e6a23c; }.notice-item > span.POLICY { background: #0e8a7a; }.notice-item div { flex: 1; min-width: 0; }.notice-item b { font-size: 12px; display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }.notice-item small { font-size: 10px; color: #93a4ac; margin-top: 5px; display: block; }
@media (max-width: 1100px) { .summary-grid { grid-template-columns: repeat(2, 1fr); }.dashboard-grid { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .summary-grid { grid-template-columns: 1fr 1fr; gap: 10px; }.summary-card { padding: 14px; min-height: 106px; }.card-symbol { display: none; }.dashboard-grid { gap: 12px; }.panel header { padding: 14px; }.chart { height: 250px; } }
</style>
