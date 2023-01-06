import type {FileInfo} from "naive-ui/es/upload/src/interface";
import type {Ref} from "vue";
import axios from "axios";

export const useUploader = <any>{
    oss(file: File | Blob, filename: string, percentage: Ref, config: any) {
        const fd = new FormData()
        fd.append('name', filename)
        fd.append('key', filename)
        fd.append('policy', config.policy)
        fd.append('OSSAccessKeyId', config.accessid)
        fd.append('success_action_status', '200')
        fd.append('callback', '')
        fd.append('signature', config.signature)
        fd.append('file', file, filename)

        return axios.post(config.host, fd, {
            onUploadProgress: progressEvent => {
                percentage.value = ~~(progressEvent.loaded / progressEvent.total * 100)
            },
            timeout: 0,
        })
    },
    qiniu(file: File | Blob, filename: string, percentage: Ref, config: any) {
        const fd = new FormData()
        fd.append('token', config.token)
        fd.append('key', filename)
        fd.append('file', file, filename)

        return axios.post(config.host, fd, {
            onUploadProgress: progressEvent => {
                percentage.value = ~~(progressEvent.loaded / progressEvent.total * 100)
            },
            timeout: 0,
        })
    },
    cos(file: File | Blob, filename: string, percentage: Ref, config: any) {
        const fd = new FormData()
        fd.append('Key', filename)
        fd.append('Signature', config.auth.token)
        fd.append('file', file, filename)

        return axios.post(config.host, fd, {
            onUploadProgress: progressEvent => {
                percentage.value = ~~(progressEvent.loaded / progressEvent.total * 100)
            },
            timeout: 0,
        })
    },
    local(file: File | Blob, filename: string, percentage: Ref, config: any) {
        const fd = new FormData()
        fd.append('key', filename)
        fd.append('file', file, filename)


        return axios.post(config.host, fd, {
            onUploadProgress: progressEvent => {
                percentage.value = ~~(progressEvent.loaded / progressEvent.total * 100)
            },
            timeout: 0,
        })
    },
    uploaded(url: string, filename: string, disk: string) {
        return axios.post(url, {
            files: filename,
            disk: disk,
        })
    },
    async upload(uploader: any, filename: string, file: File, percentage: Ref) {
        const {data: obsConfig} = await axios.get(uploader.obs_config_url, {params: {disk: uploader.disk, filename}})

        let handler;
        switch (uploader.disk) {
            case 'oss':
                handler = useUploader.oss(file, filename, percentage, obsConfig)
                break
            case 'qiniu':
                handler = useUploader.qiniu(file, filename, percentage, obsConfig)
                break
            case 'cos':
            case 'cosv5':
                handler = useUploader.cos(file, filename, percentage, obsConfig)
                break
            default:
                handler = useUploader.local(file, filename, percentage, obsConfig)
        }

        return handler.then(() => {
            return new Promise(resolve => {
                useUploader.uploaded(uploader.uploaded_url, filename, uploader.disk).then((res: any) => {
                    resolve({filename, url: res.data})
                })
            })
        })
    },
}


