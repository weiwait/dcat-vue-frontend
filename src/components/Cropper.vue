<template>
    <n-modal v-model:show="show">
        <n-space class="modal-container" vertical :size="0">
            <div :class="['cropper-container', options.large]" ref="cropperContainer">
            </div>
            <n-space vertical class="cropper-controls">
                <n-space>
                    <n-button-group size="small">
                        <n-button @click="targetUp" type="warning">↑</n-button>
                        <n-button @click="targetDown" type="warning">↓</n-button>
                        <n-button @click="targetLeft" type="warning">️←</n-button>
                        <n-button @click="targetRight" type="warning">️→</n-button>
                        <n-button @click="reset" type="warning">重置</n-button>
                        <n-button @click="remove()" type="warning">删除</n-button>
                        <n-button @click="replace()" type="warning">更换</n-button>
                    </n-button-group>
                    <n-button-group size="small">
                        <n-button @click="resolveCropped('original')" type="primary">原图</n-button>
                        <n-button @click="crop" type="primary">裁剪</n-button>
                    </n-button-group>
                </n-space>
            </n-space>
        </n-space>
    </n-modal>
</template>

<script setup lang="ts">
import {defineProps, nextTick, ref, onMounted, onBeforeUnmount} from "vue";
import Cropper from "cropperjs";
import {NModal, NSpace, NButtonGroup, NButton, NDrawer, NDrawerContent} from 'naive-ui'
import 'cropperjs/src/index.scss'

const props = defineProps<{
    options: any
    src: string,
    resolveCropped: Function,
    replace: Function,
    remove: Function,
}>()
const show = ref(false)
const cropperContainer = ref()
const img = new Image()
let cropper: Cropper

onMounted(async () => {
    img.src = props.src
    img.crossOrigin = 'anonymous'
    img.style.maxWidth = '100%'

    show.value = true

    await nextTick()

    cropperContainer.value.append(img)

    cropper = new Cropper(img, {
        checkCrossOrigin: false,
        aspectRatio: props.options.dimensions?.ratio,
    })
})

function crop() {
    const type = props.options.quality ? 'jpg' : 'png'
    const quality = props.options.quality ? props.options.quality : 1
    const cropOptions: Cropper.GetCroppedCanvasOptions = {}
    if (props.options.resolution) {
        cropOptions.width = props.options.resolution.default[0]
        cropOptions.height = props.options.resolution.default[1]
    }

    cropper.getCroppedCanvas(cropOptions).toBlob(blob => {
        props.resolveCropped(blob)
    }, type, quality)
}

function targetUp() {
    cropper.move(0, -10)
}

function targetDown() {
    cropper.move(0, 10)
}

function targetLeft() {
    cropper.move(-10, 0)
}

function targetRight() {
    cropper.move(10, 0)
}

function reset() {
    cropper.reset()
}

onBeforeUnmount(() => {
    props.resolveCropped(false)
})

</script>

<style>
.n-modal-container {
    z-index: 99999999 !important;
}
</style>

<style scoped lang="scss">
.modal-container {
    border-radius: 10px;

    .cropper-container {
        width: 480px;
        height: 270px;

        img {
            max-width: 100%;
            display: block;
        }
    }

    .large {
        width: 960px !important;
        height: 540px !important;
    }

    .cropper-controls {
        padding: 11px 0 11px 11px;
        background-color: #c9c9c9;
        border-radius: 0 0 6px 6px;
    }
}
</style>