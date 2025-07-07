<!-- 通用面板 -->
<template>
  <div class="panel">
    <div class="panel-header">
      <slot name="header">默认名称</slot>
    </div>
    <div class="panel-container">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.panel {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* padding-bottom: 24px; */
  overflow: hidden;
  .panel-header {
    position: relative;
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: url('../../assets/images/titleBg.png') no-repeat center center;
    background-size: 100% 100%;
    font-size: 15px;
    letter-spacing: 1px;
    gap: 8px;
  }
  .panel-container {
    height: 100%;
    position: relative;
    flex: 1;
    /* background: url('../../assets/images/panelBottomBg.png') no-repeat center bottom; */
    background-size: 100% 100%;
    padding: 0 24px;
    box-sizing: border-box;

  }
}

/* .panel::before {
  content: '';
  position: absolute;
  left: -50%;
  top: -50%;
  width: 200%;
  height: 200%;
  border-radius: 5px;
  background-image: conic-gradient(transparent, #ffffff, transparent 30%);
  z-index: -2;
  animation: rotation 4s linear infinite;
}

.panel::after {
  content: '';
  position: absolute;
  --g: 1px;
  width: calc(100% - var(--g) * 2);
  height: calc(100% - var(--g) * 2);
  background: #000;
  left: var(--g);
  top: var(--g);
  border-radius: inherit;
  z-index: -1;
  opacity: 0.9;
}

@keyframes rotation {
  to {
    transform: rotate(360deg);
  }
} */
</style>
