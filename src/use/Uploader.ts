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
            }
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
            }
        })
    },
    cos(file: File | Blob, filename: string, percentage: Ref, config: any) {
        const fd = new FormData()
        fd.append('Key', filename)
        fd.append('Signature', config.auth.Credentials.Token)
        fd.append('file', file, filename)

        return axios.post(config.host, fd, {
            onUploadProgress: progressEvent => {
                percentage.value = ~~(progressEvent.loaded / progressEvent.total * 100)
            }
        })
    },
    local(file: File | Blob, filename: string, percentage: Ref, config: any) {
        const fd = new FormData()
        fd.append('key', filename)
        fd.append('file', file, filename)


        return axios.post(config.host, fd, {
            onUploadProgress: progressEvent => {
                percentage.value = ~~(progressEvent.loaded / progressEvent.total * 100)
            }
        })
    },
    uploaded(url: string, filename: string, disk: string) {
        return axios.post(url, {
            files: filename,
            disk: disk,
        })
    }
}


