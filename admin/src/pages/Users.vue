<template>
  <div>
    <el-tabs v-model="activeTab" class="user-tabs">
      <!-- 授权用户 -->
      <el-tab-pane label="微信授权用户" name="auth">
        <div class="toolbar">
          <el-input
            v-model="authKeyword"
            placeholder="搜索昵称/手机号"
            clearable
            style="width: 240px;"
            @keyup.enter="loadAuth(1)"
          />
          <el-button type="primary" @click="loadAuth(1)">搜索</el-button>
        </div>
        <el-table :data="authList" stripe v-loading="authLoading">
          <el-table-column label="头像" width="80">
            <template #default="{ row }">
              <el-avatar :src="row.avatarUrl" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="nickName" label="昵称" />
          <el-table-column prop="phoneNumber" label="手机号" />
          <el-table-column prop="openid" label="openid" show-overflow-tooltip />
          <el-table-column label="更新时间" width="180">
            <template #default="{ row }">{{ formatTime(row.updatedAt) }}</template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="authTotal"
          :page-size="pageSize"
          :current-page="authPage"
          @current-change="loadAuth"
          style="margin-top: 16px;"
        />
      </el-tab-pane>

      <!-- 导入用户 -->
      <el-tab-pane label="导入用户" name="imported">
        <div class="toolbar">
          <el-upload
            :show-file-list="false"
            :auto-upload="false"
            accept=".xlsx,.xls"
            :on-change="onPickFile"
          >
            <el-button type="primary">上传 Excel</el-button>
          </el-upload>
          <span v-if="importing" style="color: #888;">导入中...</span>
        </div>
        <el-table
          :data="importedList"
          stripe
          v-loading="importedLoading"
          @cell-dblclick="onCellDblClick"
        >
          <el-table-column
            v-for="col in importedColumns"
            :key="col"
            :prop="col"
            :label="col"
            show-overflow-tooltip
          />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="openEdit(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="importedTotal"
          :page-size="pageSize"
          :current-page="importedPage"
          @current-change="loadImported"
          style="margin-top: 16px;"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑导入用户 -->
    <el-dialog v-model="editVisible" title="编辑用户资料" width="500px">
      <el-form label-width="120px" v-if="editing">
        <el-form-item
          v-for="key in editableKeys"
          :key="key"
          :label="key"
        >
          <el-input v-model="editing[key]" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { callFn, uploadFile } from '@/api/cloudbase';

const activeTab = ref<'auth' | 'imported'>('auth');
const pageSize = 20;

// ========== 授权用户 ==========
const authList = ref<any[]>([]);
const authTotal = ref(0);
const authPage = ref(1);
const authKeyword = ref('');
const authLoading = ref(false);

async function loadAuth(page = authPage.value) {
  authLoading.value = true;
  try {
    const res: any = await callFn('listAuthUsers', {
      page, pageSize, keyword: authKeyword.value
    });
    if (res?.success) {
      authList.value = res.data;
      authTotal.value = res.total;
      authPage.value = res.page;
    } else {
      ElMessage.error(res?.message || '加载失败');
    }
  } finally {
    authLoading.value = false;
  }
}

// ========== 导入用户 ==========
const importedList = ref<any[]>([]);
const importedTotal = ref(0);
const importedPage = ref(1);
const importedLoading = ref(false);
const importing = ref(false);

const importedColumns = computed(() => {
  if (!importedList.value.length) return [];
  const sample = importedList.value[0];
  return Object.keys(sample).filter(k =>
    !['_id', '_rawRow', 'importBatchId', 'createdAt', 'updatedAt'].includes(k)
  );
});

async function loadImported(page = importedPage.value) {
  importedLoading.value = true;
  try {
    const res: any = await callFn('listImportedUsers', { page, pageSize });
    if (res?.success) {
      importedList.value = res.data;
      importedTotal.value = res.total;
      importedPage.value = res.page;
    } else {
      ElMessage.error(res?.message || '加载失败');
    }
  } finally {
    importedLoading.value = false;
  }
}

async function onPickFile(file: any) {
  if (!file?.raw) return;
  importing.value = true;
  try {
    const cloudPath = `imports/${Date.now()}-${file.name}`;
    const fileID = await uploadFile(file.raw, cloudPath);
    const res: any = await callFn('importUsers', { fileID });
    if (res?.success) {
      ElMessage.success(`导入成功 ${res.inserted} 条`);
      loadImported(1);
    } else {
      ElMessage.error(res?.message || '导入失败');
    }
  } catch (e: any) {
    ElMessage.error(e.message || '上传失败');
  } finally {
    importing.value = false;
  }
}

// ========== 编辑 ==========
const editVisible = ref(false);
const editing = ref<any | null>(null);
const saving = ref(false);

const editableKeys = computed(() => {
  if (!editing.value) return [];
  return Object.keys(editing.value).filter(k =>
    !['_id', '_rawRow', 'importBatchId', 'createdAt', 'updatedAt'].includes(k)
  );
});

function openEdit(row: any) {
  editing.value = { ...row };
  editVisible.value = true;
}
function onCellDblClick(row: any) { openEdit(row); }

async function saveEdit() {
  if (!editing.value) return;
  saving.value = true;
  try {
    const patch: Record<string, any> = {};
    editableKeys.value.forEach(k => { patch[k] = editing.value[k]; });
    const res: any = await callFn('updateImportedUser', {
      id: editing.value._id, patch
    });
    if (res?.success) {
      ElMessage.success('已保存');
      editVisible.value = false;
      loadImported();
    } else {
      ElMessage.error(res?.message || '保存失败');
    }
  } finally {
    saving.value = false;
  }
}

// ========== 工具 ==========
function formatTime(t: any) {
  if (!t) return '';
  const d = new Date(t);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString();
}

onMounted(() => {
  loadAuth();
  loadImported();
});
</script>

<style scoped>
.user-tabs :deep(.el-tabs__content) { padding-top: 8px; }
.toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
</style>
