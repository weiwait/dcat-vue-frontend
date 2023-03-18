<script setup lang="ts">
import {ref, inject} from "vue";
import {NUpload, NUploadDragger, NText, NSpace, NProgress, NTag, useNotification} from "naive-ui";
import type {UploadCustomRequestOptions} from 'naive-ui'
import {useRandomName} from "@/use/RandomName";
import axios from "axios";
import {useUploader} from "@/use/Uploader";
import {empty} from "@/use/Utils";
import {useFormStore} from "@/use/FormStore";
import {Observer} from "@/use/useTraits";
import type {BaseField} from "@/component";

interface Field extends BaseField {
    options: {
        accept: {
            mimeTypes: string,
        }
    },
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
}

const provides = inject<Field>('provides')!
const store = useFormStore()

const form = store.initializer(
    provides.formId,
    provides.name,
    provides.value || [],
    provides.attributes.required || false,
    provides.attributes.disabled || false
)

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
            form.value.push(filename)
        } else {
            form.value = [filename]
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
    form.value.splice(index, 1)
}

Observer.make(provides.watches, provides.formId, provides.name)
</script>

<template>
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

    <input v-if="form.attributes.required" type="text" :required="!form.value.length" :disabled="!!form.value.length"
           :name="`${form.name}_is_required`" style="display: none;">

    <n-space class="file-list-wrap" v-for="(item, index) of form.value">
        <n-tag :closable="true" type="success" @close="clearFile(index)">{{ item }}</n-tag>
    </n-space>

    <span class="help-block" v-if="!empty(provides.help)">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="provides.multiple" v-for="item of form.value" type="hidden" :name="form.name + '[]'" :value="item">
    <input v-else v-for="item of form.value" type="hidden" :name="form.name" :value="item">
    <input v-if="!form.value.length" type="hidden" :name="form.name" :value="''">
</template>

<style scoped lang="scss">
.file-list-wrap {
    margin-top: 6px!important;
}
</style>
