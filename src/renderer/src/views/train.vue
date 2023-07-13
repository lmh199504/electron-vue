<template>
    <div class="train-page">
        <div class="top">
            <a-button type="primary">
                <router-link to="/">返回首页</router-link>
            </a-button>
        </div>
        <div class="content">
            <div class="content-upload">
                <div class="start-audio audio-wrapper">
                    <div class="audio-btn">
                        <div>开机音频：</div>
                        <Upload
                            v-model:file-list="powerOnList"
                            :multiple="true"
                            accept="audio/*"
                        ></Upload>
                        <div class="select-num">已上传{{ powerOnList.length }}条</div>
                        <div class="start-calculate">
                            <a-button type="primary" :loading="trainLoading" @click="startTrain">{{
                                trainLoading ? '计算中...' : '开始计算'
                            }}</a-button>
                        </div>
                    </div>
                    <div class="audio-list">
                        <AudioFile
                            v-for="(item, index) in powerOnList"
                            :key="index"
                            :file-data="item"
                        />
                    </div>
                </div>
                <div class="end-audio audio-wrapper">
                    <div class="audio-btn">
                        <div>停机音频：</div>
                        <Upload
                            v-model:file-list="shutDownList"
                            :multiple="true"
                            accept="audio/*"
                        ></Upload>
                        <div class="select-num">已上传{{ shutDownList.length }}条</div>
                    </div>
                    <div class="audio-list">
                        <AudioFile
                            v-for="(item, index) in shutDownList"
                            :key="index"
                            :file-data="item"
                        />
                    </div>
                </div>
            </div>
            <div class="content-calculation">
                <div class="calculation-top">
                    <div>算法参数结果：</div>
                    <div class="path-wrapper">
                        <a-input v-model:value="path" readonly placeholder="选择路径"></a-input>
                        <a-button class="btn" ghost type="primary" @click="getPath"
                            >选择目录</a-button
                        >
                    </div>
                </div>
                <div class="result-list">
                    <AudioFile v-for="(item, index) in resultList" :key="index" :file-data="item" />
                    <div v-if="trainIng" class="training">
                        <a-spin tip="训练中..." />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import AudioFile from '@renderer/components/AudioFile.vue'
import Upload from '@renderer/components/sc-upload.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import type { IAudioFile } from '@renderer/models'
import { reqTrain, reqResult } from '@renderer/api/train'
import { message } from 'ant-design-vue'
import { useIpcRenderer } from '@vueuse/electron'
// 开机音频
const powerOnList = ref<IAudioFile[]>([])
const shutDownList = ref<IAudioFile[]>([])
const os = require('os')
const fs = require('fs')
let pathCanuse = false
const localPath = localStorage.getItem('train-path')
// 目录可用
if (localPath) {
    pathCanuse = fs.existsSync(localPath)
}
const path = ref<string>(pathCanuse ? localPath : os.homedir())
const trainLoading = ref(false)
const resultList = ref<IAudioFile[]>([])
const startTrain = (): void => {
    if (powerOnList.value.length == 0) {
        message.error('请选择开机音频')
        return
    }
    if (powerOnList.value.length < 20) {
        message.error('开机音频不能少于20条')
        return
    }
    if (shutDownList.value.length == 0) {
        message.error('请选择停机音频')
        return
    }
    if (shutDownList.value.length < 20) {
        message.error('停机音频不能少于20条')
        return
    }
    if (!path.value) {
        message.error('请选择目录')
        return
    }
    trainLoading.value = true
    resultList.value = []
    reqTrain({
        shutdown_audio_list: shutDownList.value.map((item) => item.path || ''),
        power_on_audio_list: powerOnList.value.map((item) => item.path || ''),
        save_path: path.value
    })
        .then(() => {
            trainLoading.value = false
            powerOnList.value = []
            shutDownList.value = []
            message.info('开始训练')
            getResult()
            timer = setInterval(getResult, 10000)
        })
        .catch(() => {
            trainLoading.value = false
        })
}

const ipcRenderer = useIpcRenderer()
const getPath = (): void => {
    ipcRenderer.send('open-directory-dialog', 'openDirectory')
}
ipcRenderer.on('selectedItem', (_e: unknown, files: string) => {
    if (files) {
        path.value = files
        localStorage.setItem('train-path', files)
    }
})
// 定时器
const trainIng = ref(false)
let timer
const getResult = (): void => {
    reqResult()
        .then((res) => {
            if (res.success === true) {
                trainLoading.value = false
                const formatList = res.data.map((item) => {
                    return {
                        audioName: item.fileName,
                        audioSize: item.fileSize
                    }
                })
                resultList.value = formatList as IAudioFile[]
                trainIng.value = false
                message.success('已完成算法参数结果下载！', 5)
                clearInterval(timer)
            } else {
                resultList.value = []
                trainIng.value = true
            }
        })
        .catch(() => {
            resultList.value = []
            trainIng.value = true
        })
}
onMounted(() => {
    // getResult()
    // timer = setInterval(getResult, 10000)
})
onUnmounted(() => {
    clearInterval(timer)
})
</script>
<style lang="less" scoped>
.train-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
}
.top {
    border-bottom: 1px solid #e1e1e1;
    padding: 15px 0;
}
.content {
    display: flex;
    flex: 1;
    padding: 15px 0;
    overflow: hidden;
    min-height: 0;
    .content-upload {
        flex: 1;
        margin-right: 30px;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
        min-width: 0;
        .audio-wrapper {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            .audio-btn {
                display: flex;
                align-items: center;
                .select-num {
                    color: rgba(102, 102, 102, 0.77);
                    margin-left: 10px;
                }
                .start-calculate {
                    flex: 1;
                    text-align: right;
                }
            }
            .audio-list {
                min-height: 0;
                margin-top: 10px;
                flex: 1;
                border: 1px solid #e1e1e1;
                padding: 15px;
                border-radius: 8px;
                overflow: auto;
            }
        }
        .start-audio {
            margin-bottom: 10px;
        }
    }
    .content-calculation {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-width: 0;
        .calculation-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .path-wrapper {
                display: flex;
                justify-content: flex-end;
                flex: 1;
                .ant-input {
                    max-width: 300px;
                }
                .btn {
                    margin-left: 10px;
                }
            }
        }
        .result-list {
            min-height: 0;
            margin-top: 10px;
            flex: 1;
            border: 1px solid #e1e1e1;
            padding: 15px;
            border-radius: 8px;
            overflow: auto;
            .training {
                min-height: 400px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }
}
</style>
