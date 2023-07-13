export interface TrainData {
    power_on_audio_list: string[]
    shutdown_audio_list: string[]
    save_path: string
}

export interface TrainReulst {
    code: string
    data: IFile[]
    msg: string
    success: boolean
}

export interface IFile {
    fileName: string
    fileSize: string
}
