<script setup>
const props = defineProps({
    name: {
      type: String,
      default: '--',
    }
});
</script>

<template>
  <div class="content">
    <el-descriptions :column="1">
      <el-descriptions-item label="城市名称：">{{name}}</el-descriptions-item>
      <el-descriptions-item label="描述：">其实只是一个弹框</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<style scoped>
  .content {
    padding: 40px 20px 20px 20px;
  }
  :deep(.el-descriptions) {
    .el-descriptions__body {
      color: white;
      background-color: transparent;
    }
    .el-descriptions__label,
    .el-descriptions__content {
      color: white;
    }
  }
</style>
