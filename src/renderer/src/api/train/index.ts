import request from '@renderer/utils/request'
import { TrainData, TrainReulst } from './model'
import { AxiosResponse } from 'axios'

// 开始计算
export const reqTrain = (data: TrainData): Promise<AxiosResponse> =>
    request({
        url: '/trainAudio',
        method: 'POST',
        data
    })
// 获取结果
export const reqResult = (): Promise<TrainReulst> =>
    request({
        url: '/res',
        method: 'GET'
    })
