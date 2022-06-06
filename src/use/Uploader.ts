import type {FileInfo} from "naive-ui/es/upload/src/interface";
import type {Ref} from "vue";
import axios from "axios";


export function useOssUploader(file: FileInfo, filename: string, percentage: Ref, oss: any) {
    const fd = new FormData()
    fd.append('name', file.name)
    fd.append('key', filename)
    fd.append('policy', oss.policy)
    fd.append('OSSAccessKeyId', oss.accessid)
    fd.append('success_action_status', '200')
    fd.append('callback', '')
    fd.append('signature', oss.signature)
    fd.append('file', file.file!, file.name)

    return axios.post(oss.host, fd, {
        onUploadProgress: progressEvent => {
            percentage.value = ~~(progressEvent.loaded / progressEvent.total * 100)
        }
    })
}


