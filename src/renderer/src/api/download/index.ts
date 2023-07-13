import request from '@renderer/utils/request'
import { AxiosResponse } from 'axios'
import { ListParams, DownParams } from './model'

// 获取音频列表
export const reqAudioList = (params: ListParams): Promise<AxiosResponse> =>
    request({
        url: 'audioList',
        method: 'GET',
        params
    })
// 下载
export const reqDownLoad = (data: DownParams): Promise<AxiosResponse> =>
    request({
        url: '/downloadAudio',
        method: 'POST',
        data
    })
