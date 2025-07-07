<!-- 景点人流排名 -->
<template>
  <CPanel>
    <template #header>市区人均排名</template>
    <template #content>
      <vue3ScrollSeamless
        :dataList="list"
        class="list"
      >
        <div class="list-warpper">
          <article class="list__item" v-for="(item, index) in list" :key="useId">
            <section class="item__index">{{ 'NO.' + (index + 1) }}</section>
            <section class="item__label">{{ item.label }}</section>
            <div class="progress">
              <span
                class="progress__conent"
                :style="{
                  left: getProgressValue(item.value)
                }"
              ></span>
            </div>
          </article>
        </div>
      </vue3ScrollSeamless>
    </template>
  </CPanel>
</template>

<script setup lang="ts">
import { vue3ScrollSeamless } from 'vue3-scroll-seamless'
import CPanel from '@/components/common/CPanel.vue'
import { onMounted, ref, useId } from 'vue'
import { rankingOfScenicSpots } from '@/assets/data/人流排名'
const list = ref<{ label: string; value: number }[]>([])
let maxValue = 0
// 计算进度
const getProgressValue = (value: number) => {
  return -((maxValue - value) / maxValue) * 100 + '%'
}
onMounted(() => {
  list.value = rankingOfScenicSpots.sort((a, b) => b.value - a.value)
  maxValue = rankingOfScenicSpots.reduce((acc, item) => acc + item.value, 0)
})
</script>
<style scoped>
.list {
  height: 100%;
  outline: none;
  overflow: hidden;
  .list__item {
    position: relative;
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    gap: 14px;
    /* padding: 0 12px 0 24px; */
    box-sizing: border-box;
    font-size: 14px;
    .list:nth-of-type(even) {
      background: linear-gradient(90deg, rgba(92, 109, 152, 0.8), rgba(92, 109, 152, 0));
    }
    .item__index {
      width: 10%;
      color: rgba(244, 168, 65, 1);
    }
    .item__label {
      width: 30%;
      height: 100%;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      color: rgba(201, 211, 234, 1);
    }
    .progress {
      position: relative;
      width: 60%;
      height: 5px;
      background: rgba(100, 110, 132, 1);
      overflow: hidden;
      .progress__conent {
        position: absolute;
        left: -100%;
        height: 100%;
        width: 100%;
        background: linear-gradient(90deg, #ffa832, #f8c47d);
      }
    }
  }
}
.list-warpper {
  height: 100%;
  /* width: 360px; */
  margin: 0 auto;
  overflow: hidden;
}
</style>
