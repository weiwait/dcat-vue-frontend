<script setup lang="ts">
import {ref, inject} from "vue";
import type {Ref} from "vue";
import {NUpload, NUploadDragger, NText, NSpace, NProgress, NTag, useNotification} from "naive-ui";
import type {UploadCustomRequestOptions} from 'naive-ui'
import type {FileInfo} from "naive-ui/es/upload/src/interface";
import {useRandomName} from "@/use/RandomName";
import axios from "axios";

interface Field {
    options: {
        accept: {
            mimeTypes: string,
        }
    },
    column: string,
    checked: Array<string | number>,
    disabled: Array<string | number>,
    watch: Array<any>,
    obs: {
        oss: {
            dir: string,
            policy: string,
            accessid: string,
            expire: number,
            host: string,
            signature: string,
            callback: string,
        }
    },
    disk: any,
    uploaded_url: string,
    obs_config_url: string,
    dir: string,
    multiple: boolean,
    value: Array<string>
}

const provides = inject<Field>('provides')!

const value = ref(provides.value || [])
const column = ref(provides.column)
const disabled = ref(provides.disabled ?? []);

function change(e: any) {
    document.dispatchEvent(new CustomEvent(`${column.value}:change`, {
        detail: {
            value: [...value.value]
        }
    }))
}

const percentage = ref(0)
const notification = useNotification()

const customRequest = async ({file}: UploadCustomRequestOptions) => {
    const filename = provides.dir + '/' + useRandomName(file.name)

    file.status = 'uploading'
    file.name = filename
    percentage.value = 0

    const disk = provides.disk

    const {data: obsConfig} = await axios.get(provides.obs_config_url, {params: {disk, filename}})

    switch (disk) {
        case 'oss':
            viaOss(file, filename, percentage, obsConfig)
            break
        case 'qiniu':
            viaQiniu(file, filename, percentage, obsConfig)
            break
        case 'cos':
        case 'cosv5':
            viaCos(file, filename, percentage, obsConfig)
            break
        default:
            viaLocal(file, filename, percentage, obsConfig)
    }
}

function viaOss(file: FileInfo, filename: string, percentage: Ref, oss: any) {
    const fd = new FormData()
    fd.append('name', file.name)
    fd.append('key', filename)
    fd.append('policy', oss.policy)
    fd.append('OSSAccessKeyId', oss.accessid)
    fd.append('success_action_status', '200')
    fd.append('callback', '')
    fd.append('signature', oss.signature)
    fd.append('file', file.file!, file.name)

    axios.post(oss.host, fd, {
        onUploadProgress: progressEvent => {
            percentage.value = ~~(progressEvent.loaded / progressEvent.total * 100)
        }
    }).then(res => {
        file.status = 'finished'
        if (provides.multiple) {
            value.value.push(filename)
        } else {
            value.value = [filename]
        }

        axios.post(provides.uploaded_url, {
            files: filename,
            disk: provides.disk,
        })

        notification.success({
            content: `${file.name}`,
            meta: '上传成功'
        })
    }).catch(e => {
        console.log(e)
        file.status = 'error'
        notification.error({
            content: e.message,
            meta: '上传失败'
        })
    })
}

function viaQiniu(file: FileInfo, filename: string, percentage: Ref, qiniu: any) {
    const fd = new FormData()
    fd.append('token', qiniu.token)
    fd.append('key', filename)
    fd.append('file', file.file!, file.name)

    axios.post(qiniu.host, fd, {
        onUploadProgress: progressEvent => {
            percentage.value = ~~(progressEvent.loaded / progressEvent.total * 100)
        }
    }).then(res => {
        file.status = 'finished'
        if (provides.multiple) {
            value.value.push(filename)
        } else {
            value.value = [filename]
        }

        axios.post(provides.uploaded_url, {
            files: filename,
            disk: provides.disk,
        })

        notification.success({
            content: `${file.name}`,
            meta: '上传成功'
        })
    }).catch(e => {
        console.log(e)
        file.status = 'error'
        notification.error({
            content: e.message,
            meta: '上传失败'
        })
    })
}

function viaCos(file: FileInfo, filename: string, percentage: Ref, cos: any) {
    const fd = new FormData()
    fd.append('file', file.file!, file.name)


    axios.put(cos.host, fd, {
        headers: {
            'Authorization': cos.auth.Credentials.Token
        },
        onUploadProgress: progressEvent => {
            percentage.value = ~~(progressEvent.loaded / progressEvent.total * 100)
        }
    }).then(res => {
        file.status = 'finished'

        if (provides.multiple) {
            value.value.push(filename)
        } else {
            value.value = [filename]
        }

        axios.post(provides.uploaded_url, {
            files: filename,
            disk: provides.disk,
        })

        notification.success({
            content: `${file.name}`,
            meta: '上传成功'
        })
    }).catch(e => {
        console.log(e)
        file.status = 'error'
        notification.error({
            content: e.message,
            meta: '上传失败'
        })
    })
}

function viaLocal(file: FileInfo, filename: string, percentage: Ref, local: any) {
    const fd = new FormData()
    fd.append('key', filename)
    fd.append('file', file.file!, file.name)


    axios.post(local.host, fd, {
        onUploadProgress: progressEvent => {
            percentage.value = ~~(progressEvent.loaded / progressEvent.total * 100)
        }
    }).then(res => {
        file.status = 'finished'
        if (provides.multiple) {
            value.value.push(filename)
        } else {
            value.value = [filename]
        }

        axios.post(provides.uploaded_url, {
            files: filename,
            disk: provides.disk,
        })

        notification.success({
            content: `${file.name}`,
            meta: '上传成功'
        })
    }).catch(e => {
        console.log(e)
        file.status = 'error'
        notification.error({
            content: e.message,
            meta: '上传失败'
        })
    })
}

function clearFile(index: number) {
    value.value.splice(index, 1)
}

</script>

<template>
    <n-upload :custom-request="customRequest" :multiple="provides.multiple" :show-file-list="false" :accept="provides.options.accept?.mimeTypes">
        <n-upload-dragger>
            <div style="margin-bottom: 12px">
                <n-progress type="circle" :percentage="percentage"/>
            </div>
            <n-text style="font-size: 16px">
                点击或者拖动文件到该区域来上传
            </n-text>
        </n-upload-dragger>
    </n-upload>

    <n-space class="file-list-wrap" v-for="(item, index) of value">
        <n-tag :closable="true" type="success" @close="clearFile(index)">{{ item }}</n-tag>
    </n-space>

    <input v-if="provides.multiple" v-for="item of value" type="hidden" :name="column + '[]'" :value="item">
    <input v-else v-for="item of value" type="hidden" :name="column" :value="item">
</template>

<style scoped lang="scss">
.file-list-wrap {
    margin-top: 2px!important;
}
</style>
