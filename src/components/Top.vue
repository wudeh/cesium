<template>
    <div class="top-bar">
        <div class="icon-container">
            <svg class="main-icon" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="#2196f3" stroke="#fff" stroke-width="4"/>
                <path d="M32 16 L40 48 L24 48 Z" fill="#fff"/>
            </svg>
            <svg class="flow-light" viewBox="0 0 64 8">
                <defs>
                    <linearGradient id="flow-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
                        <stop offset="0%" stop-color="#00eaff" stop-opacity="0"/>
                        <stop offset="50%" stop-color="#00eaff" stop-opacity="1"/>
                        <stop offset="100%" stop-color="#00eaff" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                <rect
                    :x="flowX"
                    y="0"
                    width="24"
                    height="8"
                    fill="url(#flow-gradient)"
                    class="flow-rect"
                />
            </svg>
        </div>
        <span class="title">可视化大屏</span>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const flowX = ref(0)
let animationId = null

function animate() {
    flowX.value += 2
    if (flowX.value > 40) flowX.value = -24
    animationId = requestAnimationFrame(animate)
}

onMounted(() => {
    animate()
})

onBeforeUnmount(() => {
    cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.top-bar {
    display: flex;
    align-items: center;
    background: #101f3c;
    padding: 16px 32px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.icon-container {
    position: relative;
    width: 64px;
    height: 72px;
    margin-right: 16px;
}
.main-icon {
    width: 64px;
    height: 64px;
    display: block;
}
.flow-light {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 64px;
    height: 4px;
    pointer-events: none;
}
.title {
    font-size: 2rem;
    color: #fff;
    letter-spacing: 4px;
    font-weight: bold;
}
</style>