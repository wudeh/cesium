<template>
    <div :id="id" class="resultMarker">
        <BorderBox8 backgroundColor="#0019" :color="['#ff1522', '#ff1522']">
            <div class="content">
                <!-- <div @click="handleClose" class="btn">×</div> -->
                <div v-html="htmlContent"></div>
                <div>
                    <PercentPond :config="config" style="width:150px;height:20px;" />
                </div>
            </div>
        </BorderBox8>
    </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue';
import { BorderBox8, PercentPond } from '@kjgl77/datav-vue3';
const props = defineProps({
    id: {
        type: String,
        required: true
    },
    htmlContent: {
        type: String,
        required: true
    }
});
const config = reactive({
    value: 66,
    lineDash: [10, 2],
    borderWidth: 2,
    colors: ['#15ff22', '#15ff22','#ff00ff']
})
const handleClose = () => {
    document.getElementById(props.id);
    console.log(document.getElementById(props.id))
    alert('你干嘛，哎呦')
};
</script>
<style scoped>
.resultMarker {
    text-align: start;
    font-size: 14px;
    color: #fff;
    user-select: none;
    white-space: break-spaces;
    transform: translateY(-60px);
    pointer-events: none;
    z-index: auto;

    &:hover {
        background-color: #003116;
    }

    .content {
        height: 60px;
        padding: 20px 10px;
    }
}

.btn {
    color: rgb(255, 0, 0);
    text-align: center;
    font-size: 20px;
    line-height: 10px;
    cursor: pointer;
    text-align: end;
    position: absolute;
    right: 0;
    pointer-events: fill;
}

.resultMarker::after {
    position: absolute;
    display: block;
    content: '';
    left: 50%;
    margin-top: 5px;
    border: 2px dashed #111111c7;
    height: 60px;
    pointer-events: none;
    z-index: auto;
}

:deep(.dv-percent-pond text) {
    display: none;
}
</style>