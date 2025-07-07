<template>
    <div :id="id" class="linediv">
        <div class="content">
            <div class="html" v-html="htmlContent"></div>
        </div>
        <div class="line"></div>
    </div>
</template>
<script setup>
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
</script>
<style scoped>
.linediv {
    position: relative;
    padding: 4px;
    color: #ffffff;
    text-transform: uppercase;
    transition: 0.5s;
    cursor: pointer;
    overflow: hidden;
    white-space: break-spaces;
    text-align: left;
    transform: translateX(50%);

    .content {
        padding-left: 20px;
        .html{
            background: #001d1dd7; 
            padding: 6px 10px;
            border: 1px solid #ffc404;
            border-bottom: none;
        }
    }
    .line{
        height: 38px;
        background-image: url('../../assets/images/popupLbl.png');
    }
}
</style>