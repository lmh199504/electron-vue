<template>
    <div>
        <input
            ref="input"
            :accept="accept"
            type="file"
            class="input"
            :multiple="multiple"
            @change="fileChange"
        />
        <div @click="chooseFile">
            <slot name="default">
                <a-button type="primary" ghost>点击上传文件</a-button>
            </slot>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { IAudioFile } from '@renderer/models'
import { sizeTostr } from '@renderer/utils/fileSize'
const input = ref<HTMLInputElement>()
const props = withDefaults(
    defineProps<{ accept?: string; multiple?: boolean; fileList: Array<IAudioFile> }>(),
    {
        multiple: false,
        fileList: () => {
            return []
        },
        accept: '*'
    }
)
const emit = defineEmits<{
    (e: 'update:fileList', val: IAudioFile[]): void
}>()
const chooseFile = (): void => {
    console.log(input.value)
    input.value?.click()
}
const sourceList = computed({
    get() {
        return props.fileList || []
    },
    set(val) {
        emit('update:fileList', val)
    }
})
const fileChange = (): void => {
    const list: FileList | never[] = input.value?.files || []
    for (let i = 0; i < list.length; i++) {
        sourceList.value.push({
            audioName: list[i].name,
            audioSize: sizeTostr(list[i].size),
            status: 'success',
            ip: '',
            path: list[i].path
        })
    }
    if (input.value?.value) {
        input.value.value = ''
    }
}
</script>
<style scoped lang="less">
.input {
    display: none;
}
</style>
