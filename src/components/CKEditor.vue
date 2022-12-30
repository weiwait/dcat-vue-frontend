<!--<script setup lang="ts">-->
<!--import {ref, inject} from "vue";-->
<!--import type {BaseField} from "@/component";-->
<!--import {useUploader} from "@/use/Uploader";-->
<!--import {NScrollbar} from "naive-ui";-->
<!--import ClassicEditor from "@ckeditor/ckeditor5-build-classic"-->

<!--interface Field extends BaseField {-->
<!--    uploader: {-->
<!--        obs_config_url: string,-->
<!--        uploaded_url: string,-->
<!--        disk: string,-->
<!--        dir: string,-->
<!--    }-->
<!--}-->

<!--const review = ref(true)-->

<!--const provides = inject<Field>('provides')!-->

<!--const value = ref(provides.value || 'hello tiny mce')-->
<!--const name = ref(provides.name)-->
<!--const percentage = ref(0)-->

<!--function upload(file: any, success: Function, fail: Function) {-->
<!--    useUploader.upload(provides.uploader, 'sgweg.png', file.blob(), percentage).then(({filename, url}: any) => {-->
<!--        console.log(filename, url)-->

<!--        success(url)-->
<!--    }).catch((e: Error) => {-->
<!--        console.log(e)-->
<!--        fail(e.message)-->
<!--    })-->
<!--}-->

<!--</script>-->

<!--<template>-->
<!--    <div class="editor-container">-->
<!--        <div class="editor-wrap">-->
<!--            <c-k-editor-->
<!--                :editor="ClassicEditor"-->
<!--                v-model="value"-->
<!--            ></c-k-editor>-->
<!--        </div>-->

<!--        <div v-if="review" class="editor-review">-->
<!--            <iframe :srcdoc="value"></iframe>-->
<!--        </div>-->
<!--    </div>-->

<!--&lt;!&ndash;    <input v-if="provides.attributes.required" type="text" :required="!value.length" :disabled="!!value.length"&ndash;&gt;-->
<!--&lt;!&ndash;           :name="`${name}_is_required`" style="display: none;">&ndash;&gt;-->

<!--    <input type="hidden" :name="name " :value="value">-->
<!--    <input v-if="!value" type="hidden" :name="name" value="_def_">-->
<!--</template>-->

<!--<style scoped lang="scss">-->

<!--.editor-container {-->
<!--    display: flex;-->
<!--    flex-direction: row;-->
<!--    gap: 8px 12px;-->

<!--    .editor-wrap {-->
<!--        flex-grow: 1;-->
<!--    }-->

<!--    .editor-review {-->
<!--        width: 270px;-->
<!--        height: 480px;-->
<!--        border: 2px solid #eeeeee;-->
<!--        border-radius: 12px;-->
<!--        display: flex;-->
<!--        position: relative;-->
<!--        flex-shrink: 0;-->
<!--        box-sizing: content-box;-->
<!--        overflow-x: hidden;-->

<!--        iframe {-->
<!--            flex: 1;-->
<!--            position: absolute;-->
<!--            width: 285px;-->
<!--            height: 100%;-->
<!--            border: none;-->
<!--        }-->
<!--    }-->
<!--}-->
<!--</style>-->
