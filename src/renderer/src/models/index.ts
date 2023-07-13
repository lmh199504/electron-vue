export interface UploadProps {
    multiple: boolean
}

export interface IAudioFile {
    audioName: string
    audioSize: string
    status: statusType
    ip: string
    path?: string
}
type statusType = 'wait' | 'downloading' | 'success' | 'error' | 'stop'
