<template>
    <div class="download-page">
        <div class="top">
            <a-button type="primary">
                <router-link to="/">返回首页</router-link>
            </a-button>
        </div>
        <div class="search-tool">
            <a-form>
                <a-row :gutter="20">
                    <a-col :span="8">
                        <a-form-item label="输入盒子IP">
                            <a-input v-model:value="form.ip" placeholder="请输入"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="保存路径">
                            <div class="path-wrapper">
                                <a-input
                                    v-model:value="form.path"
                                    readonly
                                    placeholder="选择路径"
                                ></a-input>
                                <a-button class="btn" ghost type="primary" @click="getPath"
                                    >选择目录</a-button
                                >
                            </div>
                        </a-form-item>
                    </a-col>
                    <a-col :span="4">
                        <div class="search-btn">
                            <a-button type="primary" :loading="listLoading" @click="getAudioList"
                                >查看盒子音频</a-button
                            >
                        </div>
                    </a-col>
                </a-row>
                <a-row>
                    <a-col :span="10">
                        <a-form-item label="选择下载区间">
                            <a-range-picker
                                v-model:value="form.time"
                                style="width: 100%"
                                show-time
                                :placeholder="['开始时间', '结束时间']"
                                :disabled-date="dateRange"
                                :disabled-time="disabledRangeTime"
                            />
                        </a-form-item>
                    </a-col>
                    <a-col :span="14">
                        <div class="down-stop">
                            <a-button type="primary" :loading="downloading" @click="downFun"
                                >下载</a-button
                            >
                            <a-button type="primary" @click="stopFun">停止</a-button>
                        </div>
                    </a-col>
                </a-row>
            </a-form>
        </div>
        <div class="title-wrapper">
            <div class="title">盒子音频：</div>
            <div class="title">任务列表：</div>
        </div>
        <div class="content">
            <div class="box-audio">
                <!-- <AudioFile
                    v-for="(item, index) in audioList"
                    :key="index"
                    :file-data="item"
                    :show-process="false"
                /> -->
                <ScrollList :list-data="audioList">
                    <template #default="{ listItem }">
                        <AudioFile :file-data="listItem" :show-process="false" />
                    </template>
                </ScrollList>
                <div v-show="listLoading" class="spinning-loading">
                    <a-spin :spinning="listLoading"></a-spin>
                </div>
            </div>
            <div class="task-list">
                <!-- <AudioFile
                    v-for="(item, index) in downList"
                    :key="index"
                    :file-data="item"
                    :show-process="true"
                /> -->
                <ScrollList :list-data="downList">
                    <template #default="{ listItem }">
                        <AudioFile :file-data="listItem" :show-process="true" />
                    </template>
                </ScrollList>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useIpcRenderer } from '@vueuse/electron'
import AudioFile from '@renderer/components/AudioFile.vue'
import { reqAudioList, reqDownLoad } from '@renderer/api/download'
import { IAudioFile } from '@renderer/models'
import dayjs, { Dayjs } from 'dayjs'
import { message } from 'ant-design-vue'
import ScrollList from '@renderer/components/scrollList.vue'
const os = require('os')
const ipcRenderer = useIpcRenderer()

const fs = require('fs')

const getPath = (): void => {
    ipcRenderer.send('open-directory-dialog', 'openDirectory')
}
const localPath = localStorage.getItem('down-path')
let pathCanuse = false
// 目录可用
if (localPath) {
    pathCanuse = fs.existsSync(localPath)
}
const form = reactive<{
    path: string
    ip: string
    time: [Dayjs, Dayjs] | []
}>({
    path: pathCanuse ? localPath : os.homedir(),
    ip: '', // 192.168.31.169
    time: []
})
ipcRenderer.on('selectedItem', (_e: unknown, files: string) => {
    if (files) {
        form.path = files
        localStorage.setItem('down-path', files)
    }
})
const audioList = ref<IAudioFile[]>([])
const listLoading = ref(false)
const getAudioList = (): void => {
    if (!form.ip) {
        message.error('请输入ip')
        return
    }
    listLoading.value = true
    audioList.value = []
    reqAudioList({
        ip: form.ip
    })
        .then((res) => {
            for (let i = 0; i < res.data.length; i++) {
                audioList.value.push({
                    ...res.data[i],
                    ip: form.ip
                })
            }
            // audioList.value = res.data
            listLoading.value = false
            form.time = []
        })
        .catch(() => {
            listLoading.value = false
        })
}
const downList = ref<IAudioFile[]>([])
// 停止
const stopFun = (): void => {
    downList.value.forEach((item) => {
        if (item.status == 'wait') {
            item.status = 'stop'
        }
    })
    downloading.value = false
}
// 下载
const downloading = ref(false)
const downFun = async (): Promise<void> => {
    downloading.value = true
    downList.value = []
    audioList.value.forEach((item) => {
        const time = dayjs(getTimeByName(item.audioName), 'YYYYMMDD-HHmm')
        // console.log(form.time)
        if (form.time && form.time[0] && form.time[1]) {
            if (
                time.valueOf() >= form.time[0]?.startOf('minute').valueOf() &&
                time.valueOf() <= form.time[1]?.endOf('minute').valueOf()
            ) {
                downList.value.push({
                    ...item,
                    status: 'wait'
                })
            }
        } else {
            downList.value.push({
                ...item,
                status: 'wait'
            })
        }
    })
    downloading.value = true
    for (let i = 0; i < downList.value.length; i++) {
        if (downList.value[i].status == 'wait') {
            try {
                downList.value[i].status = 'downloading'
                await downFile(downList.value[i])
                downList.value[i].status = 'success'
            } catch (error) {
                downList.value[i].status = 'error'
            }
        }
    }
    downloading.value = false
}

const downFile = (audio: IAudioFile): Promise<void> => {
    return new Promise((resolve, reject) => {
        reqDownLoad({
            ip: form.ip,
            savePath: form.path,
            audioName: audio.audioName
        })
            .then(() => {
                resolve()
            })
            .catch(() => {
                reject()
            })
    })
}
const dateRange = (current: Dayjs): unknown => {
    if (audioList.value.length) {
        // 20230111-0218
        const start = dayjs(getTimeByName(audioList.value[0].audioName), 'YYYYMMDD-HHmm')
        const end = dayjs(
            getTimeByName(audioList.value[audioList.value.length - 1].audioName),
            'YYYYMMDD-HHmm'
        )
        // console.log(start, end)
        return current && (current < start.startOf('day') || current > end.endOf('day'))
    } else {
        return true
    }
}
const range = (start: number, end: number): number[] => {
    const result: number[] = []

    for (let i = start; i < end; i++) {
        result.push(i)
    }

    return result
}
const disabledRangeTime = (): unknown => {
    if (audioList.value.length == 0) {
        return {
            disabledHours: (): number[] => range(0, 24),
            disabledMinutes: (): number[] => range(0, 60),
            disabledSeconds: (): number[] => range(0, 60)
        }
    } else {
        // const start = dayjs(getTimeByName(audioList.value[0].audioName), 'YYYYMMDD-HHmm')
        // const end = dayjs(
        //     getTimeByName(audioList.value[audioList.value.length - 1].audioName),
        //     'YYYYMMDD-HHmm'
        // )
        // console.log(form.time)
        // console.log(start)
        return {
            disabledHours: (): number[] => [],
            disabledMinutes: (): number[] => [],
            disabledSeconds: (): number[] => []
        }
    }
}
const getTimeByName = (name: string): string => {
    const list = name.split('.')
    if (list) {
        return list[0]
    }
    return ''
}

// getAudioList()
</script>
<style lang="less" scoped>
.download-page {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.top {
    border-bottom: 1px solid #e1e1e1;
    padding: 15px 0;
}

.search-tool {
    padding: 15px 10px;

    .path-wrapper {
        display: flex;

        .ant-btn {
            margin-left: 10px;
        }
    }

    .search-btn {
        display: flex;
        justify-content: flex-end;
    }

    .down-stop {
        display: flex;
        justify-content: flex-end;

        .ant-btn {
            margin-left: 10px;
        }
    }
}

.title-wrapper {
    display: flex;

    .title {
        margin-bottom: 10px;
        flex: 1;

        &:first-child {
            margin-right: 30px;
        }
    }
}

.content {
    flex: 1;
    min-height: 0;
    display: flex;

    .box-audio {
        flex: 1;
        margin-right: 30px;
        border: 1px solid #e1e1e1;
        border-radius: 8px;
        // overflow: auto;
        // padding: 15px;
        height: 100%;
        position: relative;
        .spinning-loading {
            background: rgba(0, 0, 0, 0.1);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
    }

    .task-list {
        flex: 1;
        border: 1px solid #e1e1e1;
        // padding: 15px;
        border-radius: 8px;
        // overflow: auto;
        height: 100%;
    }
}
</style>
