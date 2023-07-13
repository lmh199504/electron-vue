<template>
    <div class="home">
        <div class="img">
            <img src="@renderer/assets/images/home-logo.png" alt="" />
        </div>
        <div class="btn">
            <a-button type="primary">
                <router-link to="/download">下载音频</router-link>
            </a-button>
            <a-button type="primary">
                <router-link to="/train">算法训练</router-link>
            </a-button>
        </div>
        <a-button @click="handlePrint">打印</a-button>
    </div>
</template>
<script lang="ts" setup>
import { useIpcRenderer } from '@vueuse/electron'
const ipcRenderer = useIpcRenderer()
const handlePrint = (): void => {
    ipcRenderer.send('print')
}
</script>

<style lang="less" scoped>
.home {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    .img {
        width: 162px;
        margin-right: 200px;
        img {
            width: 100%;
        }
    }
    .btn {
        display: flex;
        flex-direction: column;
        .ant-btn {
            margin-bottom: 20px;
        }
    }
}
/*
设置打印样式
 */
@media print {
    .img {
        display: none;
    }
}
</style>
