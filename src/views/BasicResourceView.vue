<template>
  <div class="page-shell">
    <div class="page-heading"><div><h1>{{ config.title }}</h1><p>{{ config.description }}</p></div><el-button type="primary" @click="openCreate"><el-icon><Plus /></el-icon>新增{{ config.short }}</el-button></div>
    <section class="panel">
      <div class="toolbar"><el-input v-model="query.keyword" clearable placeholder="输入名称搜索" style="width:260px" @keyup.enter="load" /><el-select v-if="type==='building'" v-model="query.communityId" clearable placeholder="所属社区" style="width:180px" @change="load"><el-option v-for="item in communities" :key="item.id" :label="item.label" :value="item.id" /></el-select><el-button @click="load"><el-icon><Search /></el-icon>查询</el-button><el-button @click="reset">重置</el-button></div>
      <div class="table-wrap"><el-table :data="page.records" v-loading="loading"><el-table-column type="index" label="#" width="55" />
        <template v-if="type==='community'"><el-table-column prop="name" label="社区名称" min-width="140" /><el-table-column prop="address" label="详细地址" min-width="220" /><el-table-column prop="policeStation" label="所属派出所" min-width="150" /><el-table-column prop="contactPhone" label="联系电话" width="130" /></template>
        <template v-else><el-table-column prop="communityName" label="所属社区" min-width="130" /><el-table-column prop="name" label="楼栋名称" min-width="140" /><el-table-column prop="addressDetail" label="位置说明" min-width="160" /><el-table-column prop="floors" label="楼层" width="90"><template #default="s">{{ s.row.floors }}层</template></el-table-column><el-table-column prop="units" label="单元" width="90"><template #default="s">{{ s.row.units }}个</template></el-table-column></template>
        <el-table-column label="状态" width="90"><template #default="s"><el-tag :type="s.row.status ? 'success' : 'info'">{{ s.row.status ? '启用':'停用' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="150" fixed="right"><template #default="s"><el-button link type="primary" @click="openEdit(s.row)">编辑</el-button><el-popconfirm title="确认删除这条记录？" @confirm="remove(s.row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm></template></el-table-column>
      </el-table><div class="pagination"><el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize" layout="total, prev, pager, next" :total="page.total" @current-change="load" /></div></div>
    </section>
    <el-dialog v-model="dialog" :title="`${editingId ? '编辑':'新增'}${config.short}`" width="560px"><el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <template v-if="type==='community'"><el-form-item label="社区名称" prop="name"><el-input v-model="form.name" /></el-form-item><el-form-item label="详细地址" prop="address"><el-input v-model="form.address" /></el-form-item><el-form-item label="所属派出所"><el-input v-model="form.policeStation" /></el-form-item><el-form-item label="联系电话"><el-input v-model="form.contactPhone" /></el-form-item><el-form-item label="社区说明"><el-input v-model="form.description" type="textarea" /></el-form-item></template>
      <template v-else><el-form-item label="所属社区" prop="communityId"><el-select v-model="form.communityId" style="width:100%"><el-option v-for="item in communities" :key="item.id" :label="item.label" :value="item.id" /></el-select></el-form-item><el-form-item label="楼栋名称" prop="name"><el-input v-model="form.name" /></el-form-item><el-form-item label="位置说明"><el-input v-model="form.addressDetail" /></el-form-item><el-row :gutter="16"><el-col :span="12"><el-form-item label="楼层数"><el-input-number v-model="form.floors" :min="1" /></el-form-item></el-col><el-col :span="12"><el-form-item label="单元数"><el-input-number v-model="form.units" :min="1" /></el-form-item></el-col></el-row></template>
      <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :value="1">启用</el-radio><el-radio :value="0">停用</el-radio></el-radio-group></el-form-item>
    </el-form><template #footer><el-button @click="dialog=false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></template></el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import http from '../api/http'
const props = defineProps({ type: { type: String, required: true } })
const config = computed(() => props.type === 'community' ? { title:'社区管理',short:'社区',description:'维护社区地址、所属派出所和联系信息。',api:'/communities' } : { title:'楼栋管理',short:'楼栋',description:'按社区维护楼栋、楼层和单元信息。',api:'/buildings' })
const query=reactive({pageNum:1,pageSize:10,keyword:'',communityId:null}), page=reactive({records:[],total:0}), communities=ref([]), loading=ref(false), saving=ref(false), dialog=ref(false), editingId=ref(null), formRef=ref()
const blank=()=>props.type==='community'?{name:'',address:'',policeStation:'',contactPhone:'',description:'',status:1}:{communityId:null,name:'',addressDetail:'',floors:1,units:1,status:1}
const form=reactive(blank()); const rules={name:[{required:true,message:'请输入名称'}],address:[{required:true,message:'请输入地址'}],communityId:[{required:true,message:'请选择社区'}]}
onMounted(init); watch(()=>props.type,init)
async function init(){ if(props.type==='building') communities.value=await http.get('/communities/options'); await load() }
async function load(){ loading.value=true; try{Object.assign(page,await http.get(config.value.api,{params:query}))}finally{loading.value=false} }
function reset(){Object.assign(query,{pageNum:1,pageSize:10,keyword:'',communityId:null});load()}
function openCreate(){editingId.value=null;Object.assign(form,blank());dialog.value=true}
function openEdit(row){editingId.value=row.id;Object.assign(form,blank(),row);dialog.value=true}
async function save(){await formRef.value.validate();saving.value=true;try{editingId.value?await http.put(`${config.value.api}/${editingId.value}`,form):await http.post(config.value.api,form);ElMessage.success('保存成功');dialog.value=false;load()}finally{saving.value=false}}
async function remove(id){await http.delete(`${config.value.api}/${id}`);ElMessage.success('删除成功');load()}
</script>
