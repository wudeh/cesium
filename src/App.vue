<template>
  <div class="box">
    <!-- 顶部标题，文字轮播 -->
    <Top />
    <!-- 地图 -->
    <Cesium />
    <!-- 左侧数据面板 -->
    <LeftPanel />
    <!-- 右侧数据面板 -->
    <RightPanel />
    <!-- 底部组件 -->
    <CFooter />
  </div>
</template>
 
<script setup >
    
  import Top from "@/components/Top.vue"
  import Cesium from "@/components/Cesium.vue"
  import LeftPanel from '@/components/leftPanel.vue'
  import RightPanel from '@/components/rightPanel.vue'
  import CFooter from '@/components/bottom/CFooter.vue'
  import { onMounted } from 'vue'
  import autofit from 'autofit.js'

  // onMounted(() => {
  //   autofit.init({
  //     el: 'body',
  //     dh: 923,
  //     dw: 1920,
  //     ignore: [
  //       {
  //         el: ".cesium", //必填
  //         height: "100vh", //可选，需注明单位
  //         width: "100vw", //可选，需注明单位
  //       }
  //     ],
  //     resize: true
  //   })
  // })
    
</script>
 
<style scoped>
.box{
  position: relative;
  width: 100%;
  height: 100%;
}
</style>