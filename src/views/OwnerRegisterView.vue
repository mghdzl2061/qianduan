<template>
  <div class="owner-register-page">
    <header class="register-header">
      <div class="brand"><span class="brand-mark"></span><div><b>智慧门牌</b><small>房东账号注册与房屋认证</small></div></div>
      <el-button text @click="router.push('/login')">返回登录</el-button>
    </header>

    <main class="register-main">
      <section class="register-intro">
        <p class="eyebrow mono">OWNER ACCESS / 02</p>
        <h1>注册房东账号，<br><em>从一套房屋开始。</em></h1>
        <p>选择需要认证的房屋，上传证明材料，审核通过后即可使用手机号和密码123456登录系统。</p>
        <div class="count-cards">
          <div><strong>{{ counts.totalCount }}</strong><span>系统房屋总数</span></div>
          <div><strong>{{ counts.availableCount }}</strong><span>当前可申请</span></div>
        </div>
      </section>

      <section class="register-card" v-loading="loading">
        <div class="card-heading"><div><h2>房东认证申请</h2><p>每套房屋单独审核，一个账号可以关联多套房屋。</p></div><el-button circle @click="loadOptions" title="刷新房屋列表"><el-icon><Refresh /></el-icon></el-button></div>
        <el-radio-group v-model="form.applicationType" class="apply-mode">
          <el-radio-button value="NEW">首次注册房东</el-radio-button>
          <el-radio-button value="EXISTING">已有账号追加房屋</el-radio-button>
        </el-radio-group>
        <el-alert :title="form.applicationType==='NEW'?'首次注册会创建一个待审核的房东账号，审核通过后才能登录。':'验证已有房东账号后，本次只会把新房屋追加到原账号。'" type="info" show-icon :closable="false" />
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="register-form">
          <el-form-item label="申请认证房屋" prop="publicId">
            <el-select v-model="form.publicId" filterable placeholder="请选择未登记房东的房屋" style="width:100%" no-data-text="暂无可申请房屋">
              <el-option v-for="house in houses" :key="house.publicId" :label="house.label" :value="house.publicId" />
            </el-select>
          </el-form-item>
          <el-form-item label="申请人姓名" prop="name"><el-input v-model="form.name" placeholder="请输入真实姓名" /></el-form-item>
          <el-row :gutter="14"><el-col :span="12"><el-form-item label="手机号" prop="phone"><el-input v-model="form.phone" placeholder="审核通过后用此手机号登录" /></el-form-item></el-col><el-col :span="12"><el-form-item label="身份证号" prop="idCard"><el-input v-model="form.idCard" placeholder="请输入身份证号" /></el-form-item></el-col></el-row>
          <el-form-item v-if="form.applicationType==='EXISTING'" label="已有账号密码" prop="password"><el-input v-model="form.password" type="password" show-password placeholder="验证已有房东账号" /></el-form-item>
          <el-form-item label="房产或身份证明" prop="attachment"><el-upload action="/api/public/files/upload" accept=".jpg,.jpeg,.png,.gif,.pdf" :limit="1" :on-success="fileUploaded"><el-button><el-icon><UploadFilled /></el-icon>上传照片或PDF</el-button></el-upload><small class="upload-tip">支持 JPG、PNG、GIF、PDF，大小不超过10MB</small></el-form-item>
          <el-button type="primary" size="large" class="submit-button" :loading="submitting" @click="submit">提交房东认证</el-button>
        </el-form>
      </section>
    </main>
    <footer>房屋选择和可申请数量来自系统实时数据；房东资料仅在审核业务中使用。</footer>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import http from '../api/http'
import { useAuthStore } from '../stores/auth'

const route = useRoute(), router = useRouter(), auth = useAuthStore()
const loading = ref(false), submitting = ref(false), formRef = ref()
const counts = reactive({ totalCount: 0, availableCount: 0 }), houses = ref([])
const form = reactive({ publicId: '', applicationType: auth.role === 'OWNER' ? 'EXISTING' : 'NEW', name: '', phone: '', idCard: '', password: '', attachment: '' })
const rules = {
  publicId: [{ required: true, message: '请选择要认证的房屋' }],
  name: [{ required: true, message: '请输入申请人姓名' }],
  phone: [{ required: true, message: '请输入手机号' }],
  idCard: [{ required: true, message: '请输入身份证号' }],
  password: [{ validator: (_rule, value, callback) => form.applicationType === 'EXISTING' && !value ? callback(new Error('请输入已有账号密码')) : callback() }],
  attachment: [{ required: true, message: '请上传房产或身份证明' }]
}

onMounted(loadOptions)
async function loadOptions() {
  loading.value = true
  try {
    const data = await http.get('/public/owner-registration/options')
    counts.totalCount = data.totalCount || 0
    counts.availableCount = data.availableCount || 0
    houses.value = data.houses || []
    const preferred = String(route.query.publicId || '')
    if (preferred && houses.value.some(h => h.publicId === preferred)) form.publicId = preferred
    else if (form.publicId && !houses.value.some(h => h.publicId === form.publicId)) form.publicId = ''
  } finally { loading.value = false }
}
function fileUploaded(res) { if (res.code === 0) form.attachment = res.data.url; else ElMessage.error(res.message || '上传失败') }
async function submit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    const result = await http.post('/public/owner-applications', { ...form })
    const message = result.applicationType === 'NEW'
      ? '房东账号已注册，当前处于停用状态。审核通过后，可使用手机号和密码123456登录。'
      : '已验证原房东账号，并提交本套房屋的追加认证。审核通过后，可在原账号中看到这套房屋。'
    await ElMessageBox.alert(message, '提交成功', { type: 'success' })
    router.push('/login')
  } finally { submitting.value = false }
}
</script>

<style scoped>
.owner-register-page{min-height:100vh;background:#f1f7f7;color:#17324d}.register-header{height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 max(24px,calc((100vw - 1120px)/2));background:#16364f;color:#fff}.brand{display:flex;align-items:center;gap:11px}.brand b,.brand small{display:block}.brand small{color:#98b4c1;font-size:9px;margin-top:3px;letter-spacing:.1em}.brand-mark{width:24px;height:24px;border:5px solid #55c7b3;box-shadow:inset 0 0 0 3px #16364f}.register-main{max-width:1120px;margin:0 auto;padding:52px 24px 70px;display:grid;grid-template-columns:.82fr 1.18fr;gap:56px;align-items:start}.register-intro{padding:30px 0}.eyebrow{color:#0e8a7a;font-size:10px;letter-spacing:.18em}.register-intro h1{font-size:clamp(36px,4vw,58px);line-height:1.22;margin:20px 0;color:#17324d}.register-intro h1 em{font-style:normal;color:#0e8a7a}.register-intro>p:not(.eyebrow){color:#718894;line-height:1.9;max-width:420px}.count-cards{display:flex;gap:12px;margin-top:38px}.count-cards div{min-width:130px;padding:17px 20px;border:1px solid #d5e5e4;border-radius:13px;background:#fff}.count-cards strong,.count-cards span{display:block}.count-cards strong{font:28px 'Cascadia Mono',monospace;color:#0e8a7a}.count-cards span{font-size:11px;color:#8398a1;margin-top:7px}.register-card{padding:30px;background:#fff;border:1px solid #d7e4e6;border-radius:18px;box-shadow:0 18px 45px rgba(29,73,82,.08)}.card-heading{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}.card-heading h2{margin:0;font-size:22px}.card-heading p{margin:7px 0 0;color:#8a9da4;font-size:12px}.apply-mode{display:flex;margin:18px 0 14px}.apply-mode :deep(.el-radio-button){flex:1}.apply-mode :deep(.el-radio-button__inner){width:100%}.register-form{margin-top:22px}.register-form :deep(.el-form-item){margin-bottom:19px}.upload-tip{display:block;color:#91a2a9;margin-top:8px;font-size:11px}.submit-button{width:100%;height:46px;margin-top:8px}.owner-register-page footer{text-align:center;padding:22px;color:#879ba5;font-size:11px}@media(max-width:850px){.register-main{grid-template-columns:1fr;gap:20px;padding-top:24px}.register-intro{padding:10px 0}.register-intro h1{font-size:36px}.count-cards{margin-top:24px}.register-card{padding:22px}}@media(max-width:520px){.register-header{padding:0 18px}.register-main{padding-left:16px;padding-right:16px}.register-card{border-radius:14px}.register-form :deep(.el-row){display:block}.register-form :deep(.el-col){max-width:100%;flex:0 0 100%}.apply-mode :deep(.el-radio-button__inner){padding:10px 8px;font-size:12px}}
</style>
