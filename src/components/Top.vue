<template>
    <div class="top-bar">福建省监控平台</div>
    <!-- 文字轮播 -->
    <div class="text-carousel">
        <transition-group name="carousel" tag="div" class="carousel-container">
        <div class="text-carousel-item" :key="currentIndex" v-show="currentIndex === getCurrentItemIndex()">
            {{ getCurrentItem() }}
        </div>
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 轮播数据
const carouselData = ref([
  '突发!台风安娜将在4天后来临！',
  '福建省文化和旅游厅发布《关于促进文化和旅游消费的若干措施》',
  '厦门市风景区入选"中国最美旅游景区"榜单',
  '福州市景区推出夜游项目，游客体验度大幅提升',
  '莆田市终于要挖地铁啦！',
  '三明市体育馆完成升级改造！最多容纳2万人！',
  '南平市发生山体滑坡！紧急撤离20万人！'
])

// 状态管理
const currentIndex = ref(0)
const timer = ref<number | null>(null)
const isAnimating = ref(false)
const isPaused = ref(false)

// 配置参数
const CONFIG = {
  INTERVAL: 5000, // 轮播间隔时间（毫秒）
  ANIMATION_DURATION: 500, // 动画持续时间（毫秒）
  DEBOUNCE_DELAY: 100 // 防抖延迟时间（毫秒）
}

// 获取当前显示的项目
const getCurrentItem = (): string => {
  if (carouselData.value.length === 0) return ''
  return carouselData.value[currentIndex.value]
}

// 获取当前项目索引（用于动画）
const getCurrentItemIndex = (): number => {
  return currentIndex.value
}

// 切换到下一项
const nextItem = (): void => {
  if (isAnimating.value || isPaused.value) return

  try {
    isAnimating.value = true

    setTimeout(() => {
      currentIndex.value = (currentIndex.value + 1) % carouselData.value.length
      isAnimating.value = false
    }, CONFIG.ANIMATION_DURATION)
  } catch (error) {
    console.error('轮播切换出错:', error)
    isAnimating.value = false
  }
}

// 启动轮播
const startCarousel = (): void => {
  if (timer.value) clearInterval(timer.value)
  timer.value = window.setInterval(() => {
    nextItem()
  }, CONFIG.INTERVAL)
}

onMounted(() => {
  // 启动轮播
  startCarousel()
})

onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
})
</script>

<style scoped>
@keyframes animationTop {
    from{
        top: -100px;
        opacity: 0;
    }
    to{
        top: 0;
        opacity: 1;
    }
}
.top-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 11;
    height: 87px;
    background: url('@/assets/images/top_bg2.png') no-repeat center center;
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    font-weight: 800;
    letter-spacing: 12px;
    color: rgba(230, 239, 253);
    animation: animationTop 2s linear forwards;
}

@keyframes displayText {
    0%{
        opacity: 0;
    }
    99%{
        opacity: 0;
    }
    100%{
        opacity: 1;
    }
}

.text-carousel {
  z-index: 11;
  position: absolute;
  top: 120px;
  left: 50%;
  width: 744px;
  height: 43px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, rgba(218, 163, 88, 0), rgba(218, 163, 88, 0.6), rgba(218, 163, 88, 0));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  overflow: hidden;
  cursor: pointer;
  pointer-events: all;
  animation: displayText 2s linear forwards;
  &:hover {
    background: linear-gradient(90deg, rgba(218, 163, 88, 0.1), rgba(218, 163, 88, 0.7), rgba(218, 163, 88, 0.1));
  }
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-carousel-item {
  position: absolute;
  width: 100%;
  text-align: center;
  padding: 0 20px;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transform: translateY(0);
  opacity: 1;
}

/* // 轮播动画样式 */
.carousel-enter-active,
.carousel-leave-active {
  transition: all 0.5s ease-in-out;
}

.carousel-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.carousel-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.carousel-enter-to,
.carousel-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>