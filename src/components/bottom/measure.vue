<template>
     <el-dropdown placement="top" @command="handleCommand" popper-class="custom-popover">
      <span style="color: aliceblue;">测距</span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="a">测点</el-dropdown-item>
          <el-dropdown-item command="b">测线</el-dropdown-item>
          <el-dropdown-item command="c">测面</el-dropdown-item>
          <el-dropdown-item command="d">测圆</el-dropdown-item>
          <el-dropdown-item command="e">清除</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { measureLineSpace, measureAreaSpace, clearMeasureFeature } from '@/utils/MeasureSpace';
import addDiv from "@/utils/DivBillboard.js"
import * as Cesium from "cesium"
import analyzingVisibilityFn from "@/utils/AreaAnalyze"




let DivBillboardArr = [];

let analyzeCircle = null;

let handler = null;

const addPoint = (event) => {
    let pick = viewer.scene.pick(event.position); // 获取 pick 拾取对象
    console.log('p',event.position)
    // 点个弹框出来
    const point = addDiv(viewer, event.position,3)
    // 把 点 存起来，可以销毁
    DivBillboardArr.push(point)
}

const handleCommand = (command) => {
    // 测点
    if(command == 'a'){
        handler = new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas);//处理用户输入事件
        handler.setInputAction(addPoint, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    // 测线
    if(command == 'b'){
        measureLineSpace()
    }
    // 测面
    if(command == 'c'){
        measureAreaSpace()
    }
    // 测圆
    if(command == 'd'){
        // 圆形区域分析效果
        analyzeCircle = new analyzingVisibilityFn()
        analyzeCircle.start(window.viewer)
    }
    // 删除事件监听
    if(command == 'e'){
        // 删除所有的点位弹框
        DivBillboardArr.forEach(i => i.destroy())
        // 移除鼠标左键监听
        // window.viewer.screenSpaceEventHandler.removeInputAction(addPoint, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        if(handler) handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // 删除所有 线、面
        clearMeasureFeature();
        analyzeCircle.clearAll(window.viewer)
        analyzeCircle = null
    }
    
}
</script>

<style scoped>
.custom-popover{
    background-color: red !important;
}
</style>
