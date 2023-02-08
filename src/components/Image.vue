<script setup lang="ts">
import {ref, inject, nextTick} from "vue";
import {
    NUpload,
    NUploadDragger,
    NText,
    NSpace,
    useNotification
} from "naive-ui";
import type {UploadCustomRequestOptions} from 'naive-ui'
import {useRandomName} from "@/use/RandomName";
import axios from "axios";
import {useUploader} from "@/use/Uploader";
import Cropper from "@/components/Cropper.vue";
import type {SettledFileInfo} from "naive-ui/es/upload/src/interface";

const notification = useNotification()

interface Field {
    options: {
        accept: {
            mimeTypes: string,
        },
        preview: [],
        quality: number,
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
    value: Array<string>
    attributes: any,
    help: { icon: string, text: string },
}

const provides = inject<Field>('provides')!
const type = provides.options.quality ? 'jpg' : 'png'

console.log(provides)

const value = ref(provides.value || [])
const name = ref(provides.name)

const percentage = ref(0)

const previews = ref<Array<string>>(provides.options.preview ?? [])
const currentIndex = ref<number | null>(null)
const currentSrc = ref<string>('')

const showCropper = ref(false)
const resolveCropped = ref()

const multipleQueue: any = []
const customRequest = ({file}: UploadCustomRequestOptions) => {
    file.status = 'uploading'
    multipleQueue.push(file)

    if (!showCropper.value && 1 === multipleQueue.length) {
        settledFileHandler(file)
    }
}

function cropping(src: string) {
    return new Promise<Blob | string>(async (resolve) => {
        currentSrc.value = src
        showCropper.value = true
        resolveCropped.value = resolve
    })
}

async function closeCropper(clear: boolean = true) {
    if (clear) {
        currentIndex.value = null
    }

    showCropper.value = false

    await nextTick()

    if (multipleQueue.length > 0) {
        settledFileHandler(multipleQueue[0])
    }
}

function settledFileHandler(file: SettledFileInfo) {
    cropping(URL.createObjectURL(file.file!)).then(blob => {
        let index = currentIndex.value

        if (blob instanceof Blob) {
            const filename = file.name = provides.dir + '/' + useRandomName(file.name, type)

            const preview = URL.createObjectURL(blob)

            if (null === index) {
                index = previews.value.push(preview) - 1;
            } else {
                previews.value.splice(index, 1, preview)
            }

            upload(blob, filename, index)
        }

        if ('original' === blob) {
            const filename = file.name = provides.dir + '/' + useRandomName(file.name)

            const preview = URL.createObjectURL(file.file!)

            if (null === index) {
                index = previews.value.push(preview) - 1;
            } else {
                previews.value.splice(index, 1, preview)
            }

            upload(file.file!, filename, index)
        }

        multipleQueue.shift()

        file.status = 'finished'
        closeCropper()
    }).catch(e => {
        file.status = 'error'
        console.log(e)
    })
}

async function upload(file: File | Blob, filename: string, current: number) {

    const {data: obsConfig} = await axios.get(provides.obs_config_url, {params: {disk: provides.disk, filename}})

    let upload;
    switch (provides.disk) {
        case 'oss':
            upload = useUploader.oss(file, filename, percentage, obsConfig)
            break
        case 'qiniu':
            upload = useUploader.qiniu(file, filename, percentage, obsConfig)
            break
        case 'cos':
        case 'cosv5':
            upload = useUploader.cos(file, filename, percentage, obsConfig)
            break
        default:
            upload = useUploader.local(file, filename, percentage, obsConfig)
    }

    upload.then(() => {
        if (provides.multiple) {
            value.value.push(filename)
        } else {
            value.value = [filename]
        }

        useUploader.uploaded(provides.uploaded_url, filename, provides.disk).then((res: any) => {
            previews.value[current] = res.data
        })

        // @ts-ignore
        notification.success({
            content: `文件 ${filename}`,
            title: '上传成功',
            duration: 8000,
        })
    }).catch((e: any) => {
        console.log(e)
        // @ts-ignore
        notification.error({
            content: e.message,
            duration: 8000,
        })
    })
}

function editing(index: number) {
    currentIndex.value = index

    cropping(previews.value[index]).then(blob => {
        if (blob instanceof Blob) {
            previews.value[index] = URL.createObjectURL(blob)

            const filename = provides.dir + '/' + useRandomName(value.value[index], type)
            upload(blob, filename, index)
        }

        closeCropper()
    })
}

function remove() {
    if (null !== currentIndex.value) {
        value.value.splice(currentIndex.value!, 1)
        previews.value.splice(currentIndex.value!, 1)
    }

    closeCropper()
}

const uploader = ref()

function replace() {
    // @ts-ignore
    uploader.value._.vnode.el.click()

    closeCropper(false)
}

const dragging = ref<number>()

function dragoverHandler(index: number) {
    let current = previews.value.splice(dragging.value!, 1)
    previews.value.splice(index, 0, ...current)

    current = value.value.splice(dragging.value!, 1)
    value.value.splice(index, 0, ...current)

    dragging.value = index
}

</script>

<template>
    <n-space>
        <div v-for="(preview, index) of previews"
             @click="editing(index)"
             class="preview" draggable="true"
             @dragstart="dragging = index"
             @dragover="dragoverHandler(index)"
        >
            <img :src="preview" alt="" draggable="false">
        </div>

        <n-upload v-show="provides.multiple || (!provides.multiple && !previews.length)" :custom-request="customRequest"
                  :multiple="provides.multiple" :show-file-list="false" :accept="provides.options.accept?.mimeTypes"
                  list-type="image">
            <n-upload-dragger class="custom-upload-dragger" ref="uploader">
                <n-text class="btn-plus">+</n-text>
            </n-upload-dragger>
        </n-upload>
    </n-space>

    <span class="help-block" v-if="provides.help">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="provides.attributes.required" type="text" :required="!value.length" :disabled="!!value.length"
           :name="`${name}_is_required`" style="display: none;">

    <input v-if="provides.multiple" v-for="item of value" type="hidden" :name="name + '[]'" :value="item">
    <input v-else v-for="item of value" type="hidden" :name="name" :value="item">
    <input v-if="!value.length" type="hidden" :name="name" :value="''">

    <cropper v-if="showCropper" :src="currentSrc" :resolve-cropped="resolveCropped" :replace="replace" :remove="remove"
             :options="provides.options"></cropper>
</template>

<style scoped lang="scss">
.file-list-wrap {
    margin-top: 2px !important;
}

.preview {
    width: 138px;
    height: 138px;
    border: 1px solid #dae1e7;
    border-radius: 10px;
    background-color: #f1f1f1;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
        max-width: 100%;
        max-height: 100%;
        border-radius: 4px;
        padding: 1px;
    }
}

.preview:hover {
    border: 1px dashed #2dd3c4;
}

.custom-upload-dragger {
    width: 138px;
    height: 138px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;

    .btn-plus {
        font-size: 88px;
        color: #b0b0b0;
    }
}
</style>
