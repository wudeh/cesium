<template>
     <el-dropdown placement="top" @command="handleCommand">
      <span style="color: aliceblue;">天气控制</span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="a">下雨</el-dropdown-item>
          <el-dropdown-item command="b">下雪</el-dropdown-item>
          <el-dropdown-item command="c">刮台风</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { RainEffect } from '@/utils/Rain';
import SnowEffect from '@/utils/Snow';
import { initTaiFeng, clearTaiFeng } from "@/utils/TaiFeng/TaiFeng";


let rain;
let snow;
let taiFeng;

const handleCommand = (command) => {
    if(command == 'a'){
        clearTaiFeng()
        if(rain) {
            rain.destroy();
            return;
        }
        // 添加雨天效果
        rain = new RainEffect(window.viewer);
    }
    if(command == 'b'){
        clearTaiFeng()
        if(snow) {
            snow.destroy();
            return;
        }
        // 下雪效果
        snow = new SnowEffect(window.viewer);
    }
    if(command == 'c'){
        if(taiFeng){
            clearTaiFeng();
            taiFeng = null
            return;
        }
        // 刮台风
        if(rain) rain.destroy();
        if(snow) snow.destroy();
        // 添加台风效果
        taiFeng = initTaiFeng(window.viewer)
    }
    
}
</script>
