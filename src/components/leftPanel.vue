<!-- 左侧数据面板 -->
<template>
  <div class="left-panel">
    <!-- 景点人流排名 -->
    <rankingOfScenicSpots />
    <!-- 游客年龄分布 -->
    <ageDistribution />
    <!-- 年度接待游客比 -->
    <receptionOfTourists />
  </div>
</template>

<script setup lang="ts">
import rankingOfScenicSpots from './leftPanel/rankingOfScenicSpots.vue'
import ageDistribution from './leftPanel/ageDistribution.vue'
import receptionOfTourists from './leftPanel/receptionOfTourists.vue'
</script>

<style scoped>
@keyframes animationLeft {
    from{
        left: -20%;
        opacity: 0;
    }
    to{
        left: 0;
        opacity: 1;
    }
}
.left-panel {
  position: absolute;
  width: 25vw;
  height: 85vh;
  left: 0;
  bottom: 0;
  display: grid;
  gap: 2vh;
  padding: 0 10px;
  box-sizing: border-box;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, 1fr);
  animation: animationLeft 2s linear forwards;
}
</style>
