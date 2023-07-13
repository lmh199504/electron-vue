<template>
    <div ref="scrollRef" class="scroll" @scroll="scrollHandler">
        <div ref="listRef" :style="{ height: listH + 'px', paddingTop: topHeight + 'px' }">
            <div v-for="(item, index) in showList" :key="index">
                <slot :list-item="item"></slot>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue'
import { debounce } from 'lodash'
const scrollRef = ref<HTMLElement>()
const listRef = ref<HTMLElement>()
const props = defineProps<{
    listData: Array<any>
}>()
const scrollHeight = ref(0)
const getScrollHeight = (): void => {
    scrollHeight.value = scrollRef.value?.clientHeight || 0
    // console.log(scrollHeight.value)
    setData()
}
const data = reactive({
    // 列表第一项的高度（起始高度）
    initH: 0,
    // 一行的高度
    unitH: 0,
    // 屏幕范围内能显示个数
    displayCount: 1,
    // 列表起始值
    startIdx: 0
})
const showList = computed(() => {
    let endIdx = data.startIdx + data.displayCount
    if (endIdx >= props.listData.length) endIdx = props.listData.length

    return props.listData.slice(data.startIdx, endIdx).map((v, k) => {
        v.idx = data.startIdx + k + 1
        return v
    })
})
// 列表总高度
const listH = ref(0)
// 顶部元素高度
const topHeight = ref(0)
function scrollHandler(): void {
    // 当前滚动高度
    // console.log(scrollRef.value?.scrollTop)
    const curScrollTop = scrollRef.value?.scrollTop || 0
    if (curScrollTop > 0) {
        // const addCount = Math.floor((curScrollTop - data.initH) / data.unitH)
        const addCount = Math.floor(curScrollTop / data.unitH)
        topHeight.value = addCount * data.unitH
        data.startIdx = addCount
    } else {
        topHeight.value = 0
        data.startIdx = 0
    }
}
function setData(): void {
    if (props.listData.length > 0) {
        nextTick(() => {
            // console.log(scrollHeight.value)
            // 列表距离顶部距离
            data.initH = topHeight.value
            // 计算每行高度
            if (listRef.value) {
                data.unitH = listRef.value.children[0].clientHeight || 22
            }
            // const sHeigth = scrollRef.value?.clientHeight || 0
            // 计算屏幕内能显示的行数
            data.displayCount = Math.ceil(scrollHeight.value / data.unitH)
            // 设置列表总高度 = 一行高度 * 行数
            listH.value = data.unitH * props.listData.length
            // scrollHandler()
        })
    } else {
        topHeight.value = 0
        if (scrollRef.value) {
            scrollRef.value.scrollTop = 0
        }
    }
}
watchEffect(() => {
    setData()
})
const debounceHeight = debounce(getScrollHeight, 500)
onMounted(() => {
    getScrollHeight()
    window.addEventListener('resize', debounceHeight)
})
onUnmounted(() => {
    window.removeEventListener('resize', debounceHeight)
})
</script>
<style lang="less" scoped>
.scroll {
    height: 100%;
    overflow: auto;
    padding: 15px;
}
</style>
