<!--<script setup lang="ts">-->
<!--import {ref, inject, nextTick} from "vue";-->
<!--import {-->
<!--    NUpload,-->
<!--    NUploadDragger,-->
<!--    NText,-->
<!--    NSpace,-->
<!--    NProgress,-->
<!--    NModal,-->
<!--    NTag,-->
<!--    NButtonGroup,-->
<!--    NButton,-->
<!--    useNotification-->
<!--} from "naive-ui";-->
<!--import type {UploadCustomRequestOptions} from 'naive-ui'-->
<!--import {useRandomName} from "@/use/RandomName";-->
<!--import axios from "axios";-->
<!--import {useUploader} from "@/use/Uploader";-->
<!--import {useCropper} from "@/use/Cropper";-->

<!--interface Field {-->
<!--    options: {-->
<!--        accept: {-->
<!--            mimeTypes: string,-->
<!--        },-->
<!--        previews: [],-->
<!--    },-->
<!--    column: string,-->
<!--    checked: Array<string | number>,-->
<!--    disabled: Array<string | number>,-->
<!--    watch: Array<any>,-->
<!--    obs: {-->
<!--        oss: {-->
<!--            dir: string,-->
<!--            policy: string,-->
<!--            accessid: string,-->
<!--            expire: number,-->
<!--            host: string,-->
<!--            signature: string,-->
<!--            callback: string,-->
<!--        }-->
<!--    },-->
<!--    disk: any,-->
<!--    uploaded_url: string,-->
<!--    obs_config_url: string,-->
<!--    dir: string,-->
<!--    multiple: boolean,-->
<!--    value: Array<string>-->
<!--}-->

<!--const provides = inject<Field>('provides')!-->

<!--const value = ref(provides.value || [])-->
<!--const column = ref(provides.column)-->
<!--const disabled = ref(provides.disabled ?? []);-->
<!--const previews = ref<Array<string>>(provides.options.previews ?? [])-->
<!--const currentIndex = ref<number|null>(null)-->


<!--function change(e: any) {-->
<!--    document.dispatchEvent(new CustomEvent(`${column.value}:change`, {-->
<!--        detail: {-->
<!--            value: [...value.value]-->
<!--        }-->
<!--    }))-->
<!--}-->

<!--const percentage = ref(0)-->
<!--const notification = useNotification()-->


<!--const showModal = ref(false)-->
<!--const croppingImg = ref<HTMLImageElement | null>(null)-->

<!--function showCropper() {-->
<!--    return new Promise<void>(async (resolve) => {-->
<!--        showModal.value = true-->
<!--        await nextTick()-->
<!--        resolve()-->
<!--    })-->
<!--}-->

<!--function closeCropper(clearIndex: boolean = true) {-->
<!--    showModal.value = false-->

<!--    if (clearIndex) {-->
<!--        currentIndex.value = null-->
<!--    }-->
<!--}-->


<!--const cropper = ref<useCropper | null>(null)-->

<!--async function beginCropper(file: File | null) {-->
<!--    return new Promise<{blob: File, index: number}>(done => {-->
<!--        new Promise<{src: string, file: File}>(resolve => {-->
<!--            const reader = new FileReader()-->

<!--            reader.onload = ev => {-->
<!--                resolve({src: String(ev.target?.result), file: file!})-->
<!--            }-->

<!--            reader.readAsDataURL(file!)-->
<!--        }).then(({src, file}) => {-->
<!--            showCropper().then(() => {-->
<!--                cropper.value = new useCropper(croppingImg.value!, src, done, file, currentIndex.value)-->
<!--            })-->
<!--        })-->
<!--    })-->
<!--}-->


<!--const customRequest = ({file}: UploadCustomRequestOptions) => {-->
<!--    file.status = 'uploading'-->

<!--    const filename = file.name = provides.dir + '/' + useRandomName(file.name)-->
<!--    percentage.value = 0-->

<!--    beginCropper(file.file).then(({blob, index}) => {-->
<!--        let current = index-->
<!--        if (null === index) {-->
<!--            current = previews.value.push(URL.createObjectURL(blob)) - 1;-->
<!--        } else {-->
<!--            previews.value.splice(index, 1, URL.createObjectURL(blob))-->
<!--        }-->

<!--        upload(blob, filename, current)-->
<!--        file.status = 'finished'-->
<!--        closeCropper()-->
<!--    }).catch(e => {-->
<!--        file.status = 'error'-->
<!--        console.log(e)-->
<!--    })-->
<!--}-->

<!--async function upload(file: File | Blob, filename: string, current: number) {-->

<!--    const {data: obsConfig} = await axios.get(provides.obs_config_url, {params: {disk: provides.disk, filename}})-->

<!--    let upload;-->
<!--    switch (provides.disk) {-->
<!--        case 'oss':-->
<!--            upload = useUploader.oss(file, filename, percentage, obsConfig)-->
<!--            break-->
<!--        case 'qiniu':-->
<!--            upload = useUploader.qiniu(file, filename, percentage, obsConfig)-->
<!--            break-->
<!--        case 'cos':-->
<!--        case 'cosv5':-->
<!--            upload = useUploader.cos(file, filename, percentage, obsConfig)-->
<!--            break-->
<!--        default:-->
<!--            upload = useUploader.local(file, filename, percentage, obsConfig)-->
<!--    }-->

<!--    upload.then(() => {-->
<!--        if (provides.multiple) {-->
<!--            value.value.push(filename)-->
<!--        } else {-->
<!--            value.value = [filename]-->
<!--        }-->

<!--        useUploader.uploaded(provides.uploaded_url, filename, provides.disk).then((res: any) => {-->
<!--            previews.value[current] = res.data-->
<!--        })-->

<!--        notification.success({-->
<!--            content: `文件 ${filename}`,-->
<!--            title: '上传成功',-->
<!--            duration: 10000,-->
<!--        })-->
<!--    }).catch((e: any) => {-->
<!--        console.log(e)-->
<!--        notification.error({-->
<!--            content: e.message,-->
<!--            meta: '上传失败',-->
<!--            duration: 10000,-->
<!--        })-->
<!--    })-->
<!--}-->

<!--function editing(index: number) {-->
<!--    currentIndex.value = index-->

<!--    new Promise<{blob: any, index: number}>(done => {-->
<!--        showCropper().then(() => {-->
<!--            cropper.value = new useCropper(croppingImg.value!, previews.value[index], done, 'edit', index)-->
<!--        })-->
<!--    }).then(({blob, index}) => {-->
<!--        if ((blob instanceof Blob) || (blob instanceof File)) {-->
<!--            previews.value[index] = URL.createObjectURL(blob)-->

<!--            const filename = provides.dir + '/' + useRandomName(value.value[index], 'png')-->
<!--            upload(blob, filename, index)-->
<!--        }-->

<!--        closeCropper()-->
<!--    })-->
<!--}-->

<!--function deleteHandler(index: number) {-->
<!--    value.value.splice(index, 1)-->
<!--    previews.value.splice(index, 1)-->

<!--    closeCropper()-->
<!--}-->

<!--const uploader = ref()-->
<!--function changing()-->
<!--{-->
<!--    uploader.value._.vnode.el.click()-->

<!--    closeCropper(false)-->
<!--}-->

<!--</script>-->

<!--<template>-->
<!--    <n-space v-if="previews.length">-->
<!--        <div v-for="(preview, index) of previews" @click="editing(index)" class="preview">-->
<!--            <img :src="preview" alt="">-->
<!--        </div>-->
<!--    </n-space>-->

<!--    <n-upload v-show="provides.multiple || (!provides.multiple && !previews.length)" :custom-request="customRequest"-->
<!--              :multiple="provides.multiple" :show-file-list="false" :accept="provides.options.accept?.mimeTypes"-->
<!--              list-type="image">-->
<!--        <n-upload-dragger class="upload-dragger" ref="uploader">-->
<!--            <n-text class="btn-plus">+</n-text>-->
<!--        </n-upload-dragger>-->
<!--    </n-upload>-->

<!--    <input v-if="provides.multiple" v-for="item of value" type="hidden" :name="column + '[]'" :value="item">-->
<!--    <input v-else v-for="item of value" type="hidden" :name="column" :value="item">-->

<!--    <n-modal v-model:show="showModal">-->
<!--        <div class="modal-container">-->
<!--            <div class="cropper-container">-->
<!--                <img src="" alt="" crossorigin="anonymous" ref="croppingImg">-->
<!--            </div>-->
<!--            <n-space v-if="cropper" class="cropper-controls">-->
<!--                <n-button-group size="small" class="controls-first">-->
<!--                    <n-button @click="cropper.targetUp()" type="warning">↑</n-button>-->
<!--                    <n-button @click="cropper.targetDown()" type="warning">↓</n-button>-->
<!--                    <n-button @click="cropper.targetLeft()" type="warning">️←</n-button>-->
<!--                    <n-button @click="cropper.targetRight()" type="warning">️→</n-button>-->
<!--                    <n-button @click="cropper.reset()" type="warning">重置</n-button>-->
<!--                    <n-button @click="cropper.delete(deleteHandler)" type="warning">删除</n-button>-->
<!--                    <n-button @click="changing" type="warning">更换</n-button>-->
<!--                </n-button-group>-->
<!--                <n-button-group size="small">-->
<!--                    <n-button @click="cropper.original()" type="primary">原图</n-button>-->
<!--                    <n-button @click="cropper.crop()" type="primary">裁剪</n-button>-->
<!--                </n-button-group>-->
<!--            </n-space>-->
<!--        </div>-->
<!--    </n-modal>-->
<!--</template>-->

<!--<style scoped lang="scss">-->
<!--.file-list-wrap {-->
<!--    margin-top: 2px !important;-->
<!--}-->

<!--.preview {-->
<!--    width: 138px;-->
<!--    height: 138px;-->
<!--    border: 1px solid #dae1e7;-->
<!--    border-radius: 10px;-->
<!--    background-color: #f1f1f1;-->
<!--    display: flex;-->
<!--    justify-content: center;-->

<!--    img {-->
<!--        max-width: 100%;-->
<!--        max-height: 100%;-->
<!--        border-radius: 4px;-->
<!--        padding: 1px;-->
<!--    }-->
<!--}-->

<!--.preview:hover {-->
<!--    border: 1px dashed #2dd3c4;-->
<!--}-->

<!--.upload-dragger {-->
<!--    width: 138px;-->
<!--    height: 138px;-->
<!--    display: flex;-->
<!--    justify-content: center;-->
<!--    align-items: center;-->
<!--    border-radius: 10px;-->

<!--    .btn-plus {-->
<!--        font-size: 88px;-->
<!--        color: #b0b0b0;-->
<!--    }-->
<!--}-->

<!--.modal-container {-->
<!--    display: flex;-->
<!--    flex-direction: column;-->

<!--    .cropper-container {-->
<!--        width: 480px;-->
<!--        height: 270px;-->

<!--        img {-->
<!--            max-width: 100%;-->
<!--            display: block;-->
<!--            visibility: hidden;-->
<!--        }-->
<!--    }-->

<!--    .cropper-controls {-->
<!--        height: 50px;-->
<!--        display: flex;-->
<!--        align-items: center;-->

<!--        .controls-first {-->
<!--            margin-left: 12px;-->
<!--        }-->
<!--    }-->
<!--}-->
<!--</style>-->
