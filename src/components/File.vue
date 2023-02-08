<script setup lang="ts">
import {ref, inject} from "vue";
import {NUpload, NUploadDragger, NText, NSpace, NProgress, NTag, NGrid, NGridItem, useNotification} from "naive-ui";
import type {UploadCustomRequestOptions} from 'naive-ui'
import {useRandomName} from "@/use/RandomName";
import axios from "axios";
import {useUploader} from "@/use/Uploader";
import {empty} from "@/use/Utils";

interface Field {
    options: {
        accept: {
            mimeTypes: string,
        }
    },
    column: string,
    name: string,
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
    value: Array<string>,
    attributes: any,
    help: {icon: string, text: string},
}

const provides = inject<Field>('provides')!

const value = ref(provides.value || [])
const name = ref(provides.name)
const disabled = ref(provides.disabled ?? []);

const percentage = ref(0)
const notification = useNotification()

const customRequest = async ({file}: UploadCustomRequestOptions) => {
    const filename = provides.dir + '/' + useRandomName(file.name)

    file.status = 'uploading'
    file.name = filename
    percentage.value = 0

    const disk = provides.disk

    const {data: obsConfig} = await axios.get(provides.obs_config_url, {params: {disk, filename}})

    let upload;
    switch (disk) {
        case 'oss':
            upload = useUploader.oss(file.file, filename, percentage, obsConfig)
            break
        case 'qiniu':
            upload = useUploader.qiniu(file.file, filename, percentage, obsConfig)
            break
        case 'cos':
        case 'cosv5':
            upload = useUploader.cos(file.file, filename, percentage, obsConfig)
            break
        default:
            upload = useUploader.local(file.file, filename, percentage, obsConfig)
    }

    upload.then(() => {
        file.status = 'finished'
        if (provides.multiple) {
            value.value.push(filename)
        } else {
            value.value = [filename]
        }

        useUploader.uploaded(provides.uploaded_url, filename, disk)

        // @ts-ignore
        notification.success({
            content: `${file.name}`,
            meta: '上传成功'
        })
    }).catch((e: any) => {
        console.log(e)
        file.status = 'error'
        // @ts-ignore
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
<!--    <n-grid :cols="2">-->
<!--        <n-grid-item>-->
<!--        </n-grid-item>-->
<!--    </n-grid>-->
    <n-space>
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
    </n-space>

    <input v-if="provides.attributes.required" type="text" :required="!value.length" :disabled="!!value.length"
           :name="`${name}_is_required`" style="display: none;">

    <n-space class="file-list-wrap" v-for="(item, index) of value">
        <n-tag :closable="true" type="success" @close="clearFile(index)">{{ item }}</n-tag>
    </n-space>

    <span class="help-block" v-if="!empty(provides.help)">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="provides.multiple" v-for="item of value" type="hidden" :name="name + '[]'" :value="item">
    <input v-else v-for="item of value" type="hidden" :name="name" :value="item">
    <input v-if="!value.length" type="hidden" :name="name" :value="''">
</template>

<style scoped lang="scss">
.file-list-wrap {
    margin-top: 6px!important;
}
</style>
