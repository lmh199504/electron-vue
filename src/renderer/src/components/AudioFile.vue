<template>
    <div class="audio-file">
        <div class="file-name">{{ fileData.audioName }}</div>
        <div class="file-size">{{ fileData.audioSize }}</div>
        <div v-if="showProcess" class="status">
            <CloseCircleOutlined v-if="fileData.status == 'error'" style="color: #ff0000" />
            <CheckCircleOutlined v-if="fileData.status == 'success'" style="color: #0aa744" />
            <DownloadOutlined v-if="fileData.status == 'downloading'" style="color: #4e7cfd" />
            <LoadingOutlined v-if="fileData.status == 'wait'" style="color: #646466" />
            <StopOutlined
                v-if="fileData.status == 'stop'"
                style="color: #ff7c0a; transform: rotate(90deg); display: inline-block"
            />
        </div>
    </div>
</template>
<script setup lang="ts">
import {
    CloseCircleOutlined,
    CheckCircleOutlined,
    DownloadOutlined,
    LoadingOutlined,
    StopOutlined
} from '@ant-design/icons-vue'
import { IAudioFile } from '@renderer/models/index'

withDefaults(
    defineProps<{
        showProcess?: boolean
        fileData?: IAudioFile
    }>(),
    {
        showProcess: false,
        fileData: () => {
            return {
                audioName: 'wenchang20220704-20220809_10989.mp3',
                audioSize: '3.7M',
                status: 'wait',
                ip: ''
            }
        }
    }
)
</script>
<style scoped lang="less">
.audio-file {
    display: flex;
    .file-name {
        flex: 1;
        min-width: 0px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-right: 10px;
    }
    .status {
        margin-left: 10px;
    }
}
</style>
