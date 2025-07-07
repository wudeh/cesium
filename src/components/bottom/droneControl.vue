<template>
     <el-dropdown placement="top" @command="handleCommand">
      <span style="color: aliceblue;">无人机控制</span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="a">第一人称巡航</el-dropdown-item>
          <el-dropdown-item command="b">{{ stateText }}</el-dropdown-item>
          <el-dropdown-item command="c">开始巡航</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
</template>

<script setup>
import { ref, onMounted } from "vue"
import fujianshiJson from "@/assets/json/fujian_shi.json"
import fujianJson from "@/assets/json/fujian.json"
import { Roaming } from '@/utils/Roaming';
import { ElMessage } from "element-plus"
import { ElNotification } from "element-plus"

const stateText = ref('暂停巡航')

// 是否第一人称巡航
let first = false

let roaming = null

// 福建省边界数据
const positions = (fujianJson).features[0].geometry.coordinates.flat(2).map((i,index) => {
    return [i[0], i[1], 80000];// 经纬度，高度
}).slice(0,1720);



const handleCommand = (command) => {
    if(!roaming && (command == 'a' || command == 'b')) { 
        ElNotification.warning('请先开始无人机巡航!')
        return;
    }
    if(command == 'a'){
        if(!first){
            first = true
            roaming.trackModelState(true)
        }else{
            first = false
            roaming.trackModelState(false, (fujianshiJson).features[0].properties.center)
        }
    }
        // 暂停 或者 继续 
    if(command == 'b'){
        roaming.pauseOrContinue(!roaming.isPlay)
        stateText.value = '继续巡航'
        if(roaming.isPlay) stateText.value = '暂停巡航'
    }
    if(command == 'c'){
        if(roaming) {
            ElNotification.success('无人机正在巡航福建省边界!')
            return;
        }
        // 开始无人机飞行动画
        roaming = new Roaming(viewer, {
            viewer: window.viewer
        });
        roaming.init({
            viewer: window.viewer,
            model: { url: './drone.glb'}, // 模型路径
            time: 300, // 飞行时间 秒
            isPathShow: false, // 是否显示飞行路径
            speed: 1, // 动画倍速
            data: positions // 飞行路径数据
        });
    }
    
}
</script>
