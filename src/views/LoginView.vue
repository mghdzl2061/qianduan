<template>
  <div class="login-page">
    <section class="identity-panel">
      <div class="city-grid"></div>
      <div class="identity-content">
        <div class="seal"><span></span><span></span><span></span><span></span></div>
        <p class="eyebrow">SMART COMMUNITY · 2026</p>
        <h1>一房一码，<br><em>让流动有迹可循。</em></h1>
        <p class="intro">连接房屋、房东、承租人与社区民警的数字档案入口。</p>
        <div class="identity-stats">
          <div><strong>01</strong><span>智慧门牌</span></div>
          <div><strong>04</strong><span>协同角色</span></div>
          <div><strong>24h</strong><span>业务留痕</span></div>
        </div>
      </div>
      <div class="coordinate mono">34°14′N / 108°56′E<br>XI'AN COMMUNITY ARCHIVE</div>
    </section>
    <section class="login-panel">
      <div class="login-box">
        <div class="mobile-brand"><span class="mini-seal"></span>智慧门牌</div>
        <p class="form-index mono">ACCESS / 01</p>
        <h2>登录社区档案</h2>
        <p class="form-note">使用系统分配的账号进入对应工作台</p>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="submit">
          <el-form-item label="登录账号" prop="username">
            <el-input v-model="form.username" size="large" placeholder="请输入账号" prefix-icon="User" />
          </el-form-item>
          <el-form-item label="登录密码" prop="password">
            <el-input v-model="form.password" size="large" type="password" show-password placeholder="请输入密码" prefix-icon="Lock" />
          </el-form-item>
          <el-button type="primary" size="large" :loading="loading" class="login-button" @click="submit">进入系统 <el-icon><Right /></el-icon></el-button>
        </el-form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const formRef = ref()
const loading = ref(false)
const form = reactive({ username: '', password: '' })
const rules = { username: [{ required: true, message: '请输入账号' }], password: [{ required: true, message: '请输入密码' }] }
async function submit() {
  await formRef.value.validate()
  loading.value = true
  try { await auth.login(form); router.push('/dashboard') } finally { loading.value = false }
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: grid; grid-template-columns: 1.08fr .92fr; background: #f4f8f8; }
.identity-panel { position: relative; overflow: hidden; color: #fff; background: #16364f; display: flex; align-items: center; padding: 8vw; }
.identity-panel::before { content: ''; position: absolute; width: 430px; height: 430px; border: 1px solid rgba(86,199,179,.34); border-radius: 50%; right: -100px; top: -130px; box-shadow: 0 0 0 50px rgba(86,199,179,.04), 0 0 0 100px rgba(86,199,179,.03); }
.city-grid { position: absolute; inset: 0; opacity: .22; background-image: linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px); background-size: 44px 44px; mask-image: linear-gradient(135deg, black, transparent 70%); }
.identity-content { position: relative; z-index: 1; max-width: 570px; }
.seal { display: grid; grid-template-columns: repeat(2, 14px); gap: 4px; width: max-content; margin-bottom: 42px; transform: rotate(45deg); }
.seal span { width: 14px; height: 14px; background: #55c7b3; }
.seal span:nth-child(2) { background: #f0b456; }.seal span:nth-child(3) { background: transparent; border: 3px solid #55c7b3; }
.eyebrow { color: #86b6c6; font: 11px "Cascadia Mono", monospace; letter-spacing: .22em; }
h1 { font-size: clamp(42px, 5vw, 72px); line-height: 1.18; letter-spacing: -.03em; margin: 18px 0 25px; font-weight: 700; }
h1 em { color: #58c7b4; font-style: normal; }
.intro { color: #bfd0d8; font-size: 16px; line-height: 1.8; max-width: 460px; }
.identity-stats { display: flex; gap: 42px; padding-top: 38px; margin-top: 38px; border-top: 1px solid rgba(255,255,255,.14); }
.identity-stats strong, .identity-stats span { display: block; }.identity-stats strong { font: 22px "Cascadia Mono", monospace; color: #fff; }.identity-stats span { color: #88a8b7; font-size: 11px; margin-top: 7px; }
.coordinate { position: absolute; bottom: 28px; left: 36px; color: #688c9d; font-size: 9px; line-height: 1.8; letter-spacing: .12em; }
.login-panel { display: grid; place-items: center; padding: 40px; }
.login-box { width: min(410px, 100%); }.form-index { color: #0e8a7a; font-size: 10px; letter-spacing: .18em; }
h2 { color: #17324d; font-size: 30px; margin: 12px 0 8px; }.form-note { color: #8499a4; font-size: 13px; margin: 0 0 34px; }
.login-button { width: 100%; margin-top: 8px; height: 48px; display: flex; gap: 10px; }
.mobile-brand { display: none; }.mini-seal { width: 13px; height: 13px; background: #0e8a7a; display: inline-block; margin-right: 8px; }
@media (max-width: 860px) { .login-page { grid-template-columns: 1fr; }.identity-panel { display: none; }.login-panel { min-height: 100vh; padding: 24px; }.mobile-brand { display: flex; align-items: center; font-weight: 700; margin-bottom: 52px; } }
</style>
