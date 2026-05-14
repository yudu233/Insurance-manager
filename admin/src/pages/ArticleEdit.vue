<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>隐私协议编辑</span>
          <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
        </div>
      </template>

      <el-form label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="title" placeholder="标题" />
        </el-form-item>
        <el-form-item label="内容">
          <div style="border: 1px solid #dcdfe6; width: 100%;">
            <Toolbar
              :editor="editorRef"
              :default-config="toolbarConfig"
              mode="default"
              style="border-bottom: 1px solid #dcdfe6;"
            />
            <Editor
              v-model="content"
              :default-config="editorConfig"
              mode="default"
              style="height: 500px; overflow-y: hidden;"
              @on-created="(e: any) => (editorRef = e)"
            />
          </div>
        </el-form-item>
        <el-form-item label="预览">
          <div class="preview" v-html="content" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import { ElMessage } from 'element-plus';
import { callFn } from '@/api/cloudbase';

const editorRef = shallowRef<any>();
const title = ref('隐私协议');
const content = ref('<p>本隐私协议待管理员编辑</p>');
const saving = ref(false);

const toolbarConfig = {};
const editorConfig = { placeholder: '请输入隐私协议内容...' };

async function load() {
  // getArticle 不需要 token，可直接调用云函数
  const res: any = await callFn('getArticle', { slug: 'privacy' });
  if (res?.success && res.data) {
    title.value = res.data.title || '隐私协议';
    content.value = res.data.content || '';
  }
}

async function onSave() {
  saving.value = true;
  try {
    const res: any = await callFn('updateArticle', {
      slug: 'privacy', title: title.value, content: content.value
    });
    if (res?.success) ElMessage.success('保存成功');
    else ElMessage.error(res?.message || '保存失败');
  } finally {
    saving.value = false;
  }
}

onMounted(load);
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor) editor.destroy();
});
</script>

<style scoped>
.preview {
  min-height: 100px;
  padding: 12px;
  background: #fafafa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}
</style>
