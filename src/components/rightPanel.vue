<!-- 右侧数据面板 -->
<template>
  <div class="right-panel">
    <!-- 各行业收入 -->
    <industryRevenue />
    <!-- 接待游客人数TOP5 -->
    <top5Tourists />
    <!-- 山东省实时热词 -->
    <realTimeHotWords />
  </div>
</template>

<script setup lang="ts">
import industryRevenue from './rightPanel/industryRevenue.vue'
import top5Tourists from './rightPanel/top5Tourists.vue'
import realTimeHotWords from './rightPanel/realTimeHotWords.vue'
</script>

<style scoped>
@keyframes animationRight {
    from{
        right: -20%;
        opacity: 0;
    }
    to{
        right: 0;
        opacity: 1;
    }
}
.right-panel {
  position: absolute;
  width: 25vw;
  height: 85vh;
  right: 0;
  bottom: 0;
  display: grid;
  gap: 2vh;
  padding: 0 10px;
  box-sizing: border-box;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, 1fr);
  animation: animationRight 2s linear forwards;
}
</style>
