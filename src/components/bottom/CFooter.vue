<!-- 底部组件 -->
<template>
  <footer class="number-footer">
    <div class="number-item" v-for="(item, index) in numberData" :key="item.id">
      <!-- 标题 -->
      <div class="title">{{ item.title }}</div>
      <!-- 数据 -->
      <div class="data">
        <img class="data-img" :src="item.img" alt="图标" />
        <div class="data-info">
          <!-- 数字 -->
          <div class="number">
            <Vue3Odometer class="number-value" :value="item.value" />
            <span class="number-unit">{{ item.unit }}</span>
          </div>
          <!-- 比较信息 -->
          <div class="compare">
            <span class="compare-label">较上次</span>
            <img class="compare-img" :src="item.compare === 'up' ? up : down" alt="上涨下跌图标" />
            <span
              class="compare-value"
              :style="{ color: item.compare === 'up' ? 'rgba(247, 61, 75, 1)' : 'rgba(11, 212, 167, 1)' }"
            >
              {{ item.proportion }}%
            </span>
          </div>
        </div>
      </div>

      <!-- 天气控制 -->
       <div v-if="index == 0" class="control">
        <weather />
      </div>
      <!-- 无人机控制 -->
      <div v-if="index == 1" class="control fly">
        <droneControl />
      </div>
      <!-- 加载 3DTile 模型 -->
       <div v-if="index == 1" class="control3D" @click="Tile">
        加载 3DTile 模型
      </div>
      <!-- 测距 -->
       <div v-if="index == 2" class="control">
        <measure />
      </div>
      
    </div>
  </footer>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as Cesium from "cesium";
import Vue3Odometer from 'vue3-odometer'
import 'odometer/themes/odometer-theme-default.css'
import icon3 from '@/assets/images/icon3.png'
import icon1 from '@/assets/images/icon1.png'
import icon2 from '@/assets/images/icon2.png'
import up from '@/assets/images/up.png'
import down from '@/assets/images/down.png'
import droneControl from './droneControl.vue'
import weather from './weather.vue'
import measure from './measure.vue'
import fujianshiJson from '@/assets/json/fujian_shi.json';
import fujianJson from '@/assets/json/fujian.json';
import setLightArea from '@/utils/LightArea';


const numberData = ref([
  {
    title: '2022年人均收入',
    value: 12345.6,
    unit: '万元',
    compare: 'down',
    proportion: 2.9,
    img: icon1
  },
  {
    title: '2022年来访游客数',
    value: 731.2,
    unit: '万人',
    compare: 'up',
    proportion: 1.6,
    img: icon3
  },
  {
    title: '2022年人均支出',
    value: 8373.1,
    unit: '万元',
    compare: 'down',
    proportion: 2.9,
    img: icon2
  }
])

let intervalId = null

// 用于存储上一次的 value 值
const lastValues = ref(numberData.value.map((item) => item.value))

function randomizeNumberData() {
  numberData.value = numberData.value.map((item, idx) => {
    // 生成一个基于当前值的随机浮动（±10%）
    const randomFactor = 1 + (Math.random() - 0.5) * 0.2 // ±10%
    const prevValue = lastValues.value[idx]
    const newValue = +(item.value * randomFactor).toFixed(1)
    // 计算变化百分比
    let proportion = 0
    let compare = 'up'
    if (prevValue !== 0) {
      proportion = +(((newValue - prevValue) / Math.abs(prevValue)) * 100).toFixed(1)
      compare = proportion >= 0 ? 'up' : 'down'
      proportion = Math.abs(proportion)
    }
    // 更新lastValues
    lastValues.value[idx] = newValue
    return {
      ...item,
      value: newValue,
      proportion,
      compare
    }
  })
}

// 加载 3DTile 
let tileset = null

let scene = null;

const Tile = async () => {
  scene = window.viewer.scene
  // 加载香港某城市 3DTile 模型
  if(!tileset){
    // tileset = await Cesium.Cesium3DTileset.fromUrl('https://wudehuablog.netlify.app/tile_20_27_CESIUM/tileset.json')
    tileset = await Cesium.Cesium3DTileset.fromUrl('https://wudeh.github.io/tile_20_27_CESIUM/tileset.json')
    window.viewer.scene.primitives.add(tileset); // 将倾斜摄影实体加载到地图上
    window.viewer.zoomTo(tileset)
    // 删除暗面
    window.viewer.entities.remove(window.lightArea)
    // 把cesium的动画开关关闭
    window.viewer.clock.shouldAnimate = false;

  }else{
    // 清除模型
    window.viewer.scene.primitives.remove(tileset);
    tileset = null;
    // 加上暗面
    window.viewer.entities.add(window.lightArea)
    // 相机回原位置
    window.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees((fujianshiJson).features[0].properties.center[0], (fujianshiJson).features[0].properties.center[1], 2000000), // 设置位置
      orientation: {
        heading: Cesium.Math.toRadians(0), // 方向
        pitch: Cesium.Math.toRadians(-90),// 倾斜角度
        roll: 0
      },
      duration: 5, // 设置飞行持续时间，默认会根据距离来计算
      complete: async () => {
        // 到达位置后执行的回调函数
      },
      cancle: function () {
        // 如果取消飞行则会调用此函数
      },
      pitchAdjustHeight: -90, // 如果摄像机飞越高于该值，则调整俯仰俯仰的俯仰角度，并将地球保持在视口中。
      maximumHeight: 5000, // 相机最大飞行高度
      flyOverLongitude: 100, // 如果到达目的地有2种方式，设置具体值后会强制选择方向飞过这个经度(这个，很好用)
    });
  }
}

onMounted(() => {
  // 初始化lastValues
  lastValues.value = numberData.value.map((item) => item.value)
  intervalId = window.setInterval(() => {
    randomizeNumberData()
  }, 10000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.number-footer {
  position: absolute;
  width: 100%;
  bottom: 24px;
  display: flex;
  justify-content: center;
  gap: 0.5vw;
  pointer-events: none;
}
.number-item {
  position: relative;
  width: 15vw;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  pointer-events: auto;
  .title {
    height: 20px;
    width: 100%;
    background: url('@/assets/images/titleBg.png') no-repeat center center;
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }
  .data {
    height: 40px;
    width: 100%;
    display: flex;
    gap: 10px;
    justify-content: center;
    .data-img {
      width: 40px;
      height: 40px;
    }
    .data-info {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 10px;
    }
    .number {
      display: flex;
      align-items: end;
      gap: 10px;
      .number-value {
        font-size: 20px;
        font-family: 'UniDreamLED';
        color: #fff;
        text-shadow: 0px 0px 13px rgb(154, 110, 44);
      }
      .number-unit {
        font-size: 14px;
        color: #fff;
      }
    }
    .compare {
      display: flex;
      align-items: center;
      gap: 10px;
      .compare-label {
        font-size: 14px;
        color: #c9d3ea;
        margin-right: 14px;
      }
      .compare-img {
        width: 20px;
        height: 12px;
      }
    }
  }
  .control {
    position: absolute;
    top: -24%;
    left: 50%;
    transform: translate(-50%, 0);
  }
  .fly{
    top: -50%;
  }
  .control3D {
    position: absolute;
    top: -28%;
    left: 50%;
    transform: translate(-50%, 0);
    white-space: nowrap;
    font-size: 14px;
    cursor: pointer;
  }
}
</style>
