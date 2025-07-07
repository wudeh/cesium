<template>
<div class="menu">
  <div
    v-for="(item, index) in MENU_LIST"
    :key="index"
    class="menu-item"
  >
    <img :src="item.icon" alt="" class="menu-icon" />
    <span>{{ item.name }}</span>
  </div>
  <div class="menu-item">
    <img :src="middleIcon" class="menu-icon-middle" alt="">
  </div>
</div>
</template>
<script setup>
import icon3 from '@/assets/images/icon4.png'
import icon1 from '@/assets/images/icon5.png'
import icon2 from '@/assets/images/icon6.png'
import middleIcon from '@/assets/images/icon7.svg'
const MENU_LIST = [
  {
    icon: icon1,
    name: '收入',
  },
  {
    icon: icon2, 
    name: '支出',
  },
  {
    icon: icon3,
    name: '消费',
  }
]
</script>  
<style>
.menu {
  position: relative;
  width: 80%;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
  .menu-item {
      width: 50px;
      height: 50px;
      display: flex;
      flex-direction: column;
      align-items: center;
      /* padding: 33px 0; */
      position: absolute;
      cursor: pointer;
      
    }
}

/* //3个卡片,x和y轴动画加起来是20s , 20s/3 约等于 6.667s */
      /* //每个球y轴动画延迟 从0递减2.857s,x轴与y相差动画时长的一半（10s/2） */
.menu-item:nth-child(1) {
animation: animateX 10s cubic-bezier(0.36, 0, 0.64, 1) -5s infinite alternate,
    animateY 10s cubic-bezier(0.36, 0, 0.64, 1) 0s infinite alternate,
    scaleAnimate 20s cubic-bezier(0.36, 0, 0.64, 1) 0s infinite alternate;
    z-index: 1;
}
.menu-item:nth-child(2) {
animation: animateX 10s cubic-bezier(0.36, 0, 0.64, 1) -11.667s infinite alternate,
    animateY 10s cubic-bezier(0.36, 0, 0.64, 1) -6.667s infinite alternate,
    scaleAnimate 20s cubic-bezier(0.36, 0, 0.64, 1) -6.667s infinite alternate;
    z-index: 1;
}

.menu-item:nth-child(3) {
animation: animateX 10s cubic-bezier(0.36, 0, 0.64, 1) -18.334s infinite alternate,
    animateY 10s cubic-bezier(0.36, 0, 0.64, 1) -13.334s infinite alternate,
    scaleAnimate 20s cubic-bezier(0.36, 0, 0.64, 1) -13.334s infinite alternate;
    z-index: 1;
}

.menu-icon-middle{
    width: 100px;
}

.menu-item:nth-child(4) {
    left: 100px;
    top: 20px;
}
@keyframes animateX {
  0% {
    left: -50px;
  }
  100% {
    left: 100%;
  }
}

@keyframes animateY {
  0% {
    top: -20px;
  }
  100% {
    top: 80px;
  }
}

@keyframes scaleAnimate {
  0% {
    transform: scale(0.6);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.6);
  }
}
</style>
